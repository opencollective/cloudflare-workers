const apiKeys = {
  production: '_PRODUCTION_API_KEY_',
  staging: '_STAGING_API_KEY_',
};

const domains = {
  production: {
    frontend: 'frontend.opencollective.com',
    api: 'api.opencollective.com',
    images: 'images.opencollective.com',
    invoices: 'invoices.opencollective.com',
    rest: 'rest.opencollective.com',
  },
  staging: {
    frontend: 'frontend-staging.opencollective.com',
    api: 'api-staging.opencollective.com',
    images: 'images-staging.opencollective.com',
    invoices: 'invoices-staging.opencollective.com',
    rest: 'rest-staging.opencollective.com',
  },
};

// All languages with at least 50% completion on https://crowdin.com/project/opencollective
const detectableLanguages = ['en', 'fr', 'pt', 'es'];

// All languages with at least 20% completion on https://crowdin.com/project/opencollective
const availableLanguages = [
  'en',
  'ca',
  'zh',
  'cs',
  'nl',
  'fr',
  'de',
  'it',
  'ja',
  'ko',
  'pt',
  'ru',
  'es',
];

addEventListener('fetch', event => {
  event.passThroughOnException();

  event.respondWith(handleOpenCollective(event));
});

function getEnvironment(url) {
  if (
    url.hostname === 'staging.opencollective.com' ||
    url.hostname === 'api-staging.opencollective.com'
  ) {
    return 'staging';
  }
  if (
    url.hostname === 'opencollective.com' ||
    url.hostname === 'api.opencollective.com'
  ) {
    return 'production';
  }
}

function getBackend(url) {
  // api v1
  if (url.pathname.match(/^\/api\/v1\/.*/) || url.pathname.match(/^\/v1\/.*/)) {
    return 'rest';
  }
  // api
  if (url.pathname.indexOf('/api/') === 0) {
    return 'api';
  }
  // Invoices
  if (url.pathname.match(/(invoice\.pdf|invoice\.html)$/)) {
    return 'invoices';
  }
  // Manifest
  if (url.pathname.match(/(manifest\.json)$/)) {
    return 'frontend';
  }
  // REST API (json, csv)
  if (url.pathname.match(/(\.json|\.csv)$/)) {
    return 'rest';
  }
  // public
  if (url.pathname.match(/^\/public\//)) {
    return 'frontend';
  }
  // static-images
  if (url.pathname.match(/^\/static\/images\/.*/)) {
    return 'frontend';
  }
  // logo
  // e.g. /react-native-elements/logo.txt
  if (url.pathname.match(/^\/([^/]*)\/logo\.(jpg|png|svg|txt)/)) {
    return 'images';
  }
  // badge
  // e.g. /webpack/backers/badge.svg
  if (url.pathname.match(/\/badge.(png|svg)$/)) {
    return 'images';
  }
  // avatar
  // e.g. /mochajs/sponsor/0/avatar.svg
  if (url.pathname.match(/\/avatar(\.(png|svg|jpg))?$/)) {
    return 'images';
  }
  // website
  // e.g. /mochajs/sponsor/0/website
  if (url.pathname.match(/\/website$/)) {
    return 'images';
  }
  // backers/sponsors and tiers (svg and png)
  // e.g. /mochajs/backers.svg or /gulpjs/tiers/individual.svg
  if (
    url.pathname.match(
      /^\/([^/]*)\/(backers?|sponsors?|organizations?|individuals?|tiers\/([^/]*)).(png|svg)$/,
    )
  ) {
    return 'images';
  }
  // contributors
  // mosaic of github contributors
  if (url.pathname.match(/\/contributors\.svg$/)) {
    return 'images';
  }
  // default
  return 'frontend';
}

function addResponseHeaders(response, responseHeaders) {
  const headers = {};
  for (const pair of response.headers) {
    headers[pair[0]] = pair[1];
  }
  Object.keys(responseHeaders).forEach(key => {
    headers[key] = responseHeaders[key];
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

async function handleOpenCollective(event) {
  const request = event.request;
  const url = new URL(request.url);
  const environment = getEnvironment(url);
  const backend = getBackend(url);
  const responseHeaders = {};
  if (backend) {
    responseHeaders['oc-backend'] = backend;
  }
  if (environment) {
    responseHeaders['oc-environment'] = environment;
  }
  let response;
  if (domains[environment] && domains[environment][backend]) {
    url.hostname = domains[environment][backend];
  }
  if (backend === 'api' && url.pathname.indexOf('/api/') === 0) {
    url.pathname = url.pathname.replace('/api/', '');
    url.searchParams.set('api_key', apiKeys[environment]);
  }
  // Redirects
  if (backend === 'frontend' && url.pathname === '/about') {
    return Response.redirect('https://docs.opencollective.com/help/about', 301);
  }
  if (backend === 'frontend' && url.pathname === '/opensourcecollective') {
    return Response.redirect('https://opencollective.com/opensource', 301);
  }
  // Localization
  if (backend === 'frontend') {
    const language = getLanguage(request);
    if (language) {
      responseHeaders['oc-language'] = language;
      if (language !== 'en' && !url.searchParams.get('language')) {
        url.searchParams.set('language', language);
      }
    }
  }
  response = await fetch(url, request);
  if (Object.keys(responseHeaders).length) {
    response = addResponseHeaders(response, responseHeaders);
  }
  return response;
}

function getLanguage(request) {
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const cookies = parseCookie(cookie);
    if (cookies.language && availableLanguages.includes(cookies.language)) {
      return cookies.language;
    }
  }
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const detectedLanguage = pickLanguage(detectableLanguages, acceptLanguage);
    return detectedLanguage;
  }
}

/* Adapted from https://github.com/opentable/accept-language-parser */

function parseLanguage(al) {
  const strings = (al || '').match(
    /((([a-zA-Z]+(-[a-zA-Z0-9]+){0,2})|\*)(;q=[0-1](\.[0-9]+)?)?)*/g,
  );
  return strings
    .map(m => {
      if (!m) {
        return;
      }

      const bits = m.split(';');
      const ietf = bits[0].split('-');
      const hasScript = ietf.length === 3;

      return {
        code: ietf[0],
        script: hasScript ? ietf[1] : null,
        region: hasScript ? ietf[2] : ietf[1],
        quality: bits[1] ? parseFloat(bits[1].split('=')[1]) : 1.0,
      };
    })
    .filter(r => {
      return r;
    })
    .sort((a, b) => {
      return b.quality - a.quality;
    });
}

/* Adapted from https://github.com/opentable/accept-language-parser */

function pickLanguage(supportedLanguages, acceptLanguage, options) {
  options = options || {};

  if (!supportedLanguages || !supportedLanguages.length || !acceptLanguage) {
    return null;
  }

  acceptLanguage = parseLanguage(acceptLanguage);

  const supported = supportedLanguages.map(support => {
    const bits = support.split('-');
    const hasScript = bits.length === 3;

    return {
      code: bits[0],
      script: hasScript ? bits[1] : null,
      region: hasScript ? bits[2] : bits[1],
    };
  });

  for (let i = 0; i < acceptLanguage.length; i++) {
    const lang = acceptLanguage[i];
    const langCode = lang.code.toLowerCase();
    const langRegion = lang.region ? lang.region.toLowerCase() : lang.region;
    const langScript = lang.script ? lang.script.toLowerCase() : lang.script;
    for (let j = 0; j < supported.length; j++) {
      const supportedCode = supported[j].code.toLowerCase();
      const supportedScript = supported[j].script
        ? supported[j].script.toLowerCase()
        : supported[j].script;
      const supportedRegion = supported[j].region
        ? supported[j].region.toLowerCase()
        : supported[j].region;
      if (
        langCode === supportedCode &&
        (options.loose || !langScript || langScript === supportedScript) &&
        (options.loose || !langRegion || langRegion === supportedRegion)
      ) {
        return supportedLanguages[j];
      }
    }
  }

  return null;
}

/**
 * Parse a cookie header.
 *
 * Adapted from https://github.com/jshttp/cookie
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @return {object}
 * @public
 */

function parseCookie(str) {
  const pairSplitRegExp = /; */;

  const obj = {};
  const pairs = str.split(pairSplitRegExp);

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    let eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    const key = pair.substr(0, eq_idx).trim();
    let val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val);
    }
  }

  return obj;
}

/**
 * Try decoding a string using a decoding function.
 *
 * Adapted from https://github.com/jshttp/cookie
 *
 * @param {string} str
 * @private
 */

function tryDecode(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

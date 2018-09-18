const logsUrls = {
  default: '_DEFAULT_LOGGING_URL_',
  website: '_WEBSITE_LOGGING_URL_',
};

const apiKeys = {
  production: '_PRODUCTION_API_KEY_',
  staging: '_STAGING_API_KEY_',
};

const domains = {
  production: {
    website: 'website.opencollective.com',
    frontend: 'frontend.opencollective.com',
    api: 'api.opencollective.com',
    images: 'images.opencollective.com',
  },
  staging: {
    website: 'website-staging.opencollective.com',
    frontend: 'frontend-staging.opencollective.com',
    api: 'api-staging.opencollective.com',
    images: 'images.opencollective.com',
  },
};

addEventListener('fetch', event => {
  event.passThroughOnException();

  event.respondWith(handleOpenCollective(event));
});

function getEnvironment(url) {
  if (url.hostname === 'staging.opencollective.com') {
    return 'staging';
  }
  if (url.hostname === 'opencollective.com') {
    return 'production';
  }
}

function getBackend(url) {
  // index
  if (url.pathname === '/') {
    return 'frontend';
  }
  // api
  if (url.pathname.indexOf('/api/') === 0) {
    return 'api';
  }
  // proxy
  if (url.pathname.indexOf('/proxy/') === 0) {
    return 'images';
  }
  // website-static
  if (url.pathname.match(/^\/(learn-more|discover)$/)) {
    return 'website';
  }
  // website-static
  if (
    url.pathname.match(/^\/(faq|about)$/i) ||
    url.pathname.match(/^\/faq\/.+/i)
  ) {
    return 'frontend';
  }
  // invoice
  if (url.pathname.match(/(invoice\.pdf|invoice\.html|banner.md)$/)) {
    return 'website';
  }
  // apply
  if (url.pathname.match(/^\/(opensource|github)\/apply/)) {
    return 'website';
  }
  // members
  if (url.pathname.match(/\/members\/.+\.json$/)) {
    return 'frontend';
  }
  // json
  if (url.pathname.match(/\.json$/)) {
    return 'frontend';
  }
  // public
  if (url.pathname.match(/^\/public\//)) {
    return 'website';
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
    return 'frontend';
  }
  // backers
  // e.g. /mochajs/backers.svg or /gulpjs/tiers/individual.svg
  if (
    url.pathname.match(
      /^\/([^/]*)\/(backers?|sponsors?|tiers\/([^/]*)).(png|svg)$/,
    )
  ) {
    return 'images';
  }
  // contributors
  // mosaic of github contributors
  if (url.pathname.match(/\/contributors\.svg$/)) {
    return 'images';
  }
  // frontend-static
  if (url.pathname.match(/^\/(static|_next|tos|privacypolicy)/)) {
    return 'frontend';
  }
  // button
  if (
    url.pathname.match(/^\/(widgets|([^/]*)\/(donate|contribute)\/button.*)/)
  ) {
    return 'frontend';
  }
  // images
  if (url.pathname.match(/\.(png|jpg)$/)) {
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
  const log = getLog(request);
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
  response = await fetch(url, request);
  if (Object.keys(responseHeaders).length) {
    response = addResponseHeaders(response, responseHeaders);
  }
  // Logging
  log.response.status = response.status;
  const location = response.headers.get('Location');
  const contentType = response.headers.get('Content-Type');
  // We skip Redirects and Statics (Images + Fonts)
  if (
    !location &&
    contentType &&
    contentType.indexOf('image') === -1 &&
    contentType.indexOf('font') === -1
  ) {
    event.waitUntil(postLog(logsUrls[backend] || logsUrls['default'], log));
  }
  return response;
}

function getLog(request, response) {
  const headers = {};
  for (const pair of request.headers) {
    headers[pair[0]] = pair[1];
  }
  const url = new URL(request.url);
  const log = {
    request: {
      time: new Date().toISOString(),
      address: headers['cf-connecting-ip'],
      method: request.method,
      url: url.pathname + url.search,
      headers: headers,
    },
    response: {
      status: response ? response.status : 200,
    },
  };
  return log;
}

function postLog(url, log) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(log),
    headers: {
      'user-agent': 'Cloudflare Worker',
      'content-type': 'application/json',
    },
  });
}

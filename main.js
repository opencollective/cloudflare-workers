const domains = {
  'production': {
    'website': 'opencollective-prod-website.herokuapp.com',
    'frontend': 'oc-prod-frontend.herokuapp.com',
    'images': 'oc-prod-image-server.herokuapp.com'
  },
  'staging': {
    'website': 'opencollective-staging-website.herokuapp.com',
    'frontend': 'oc-staging-frontend.herokuapp.com',
    'images': 'oc-prod-image-server.herokuapp.com'
  }
};

addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Disable for avatars
  if (url.pathname.indexOf('/avatar') !== -1 || url.pathname.indexOf('/avatar.') !== -1) {
    return;
  }
  const environment = getEnvironment(url);
  // 100% of the traffic for production
  if (environment == 'production') {
    event.respondWith(handleOpenCollective(event.request))
  }
  // 100% of the traffic for staging
  if (environment == 'staging') {
    event.respondWith(handleOpenCollective(event.request))
  }
})

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
    return 'website';
  }
  // proxy
  if (url.pathname.indexOf('/proxy/') === 0) {
    return 'images';
  }
  // website-static
  if (url.pathname.match(/^\/(faq|learn-more|discover|about)$/)) {
    return 'website';
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
  if (url.pathname.match(/^\/([^/]*)\/(backers?|sponsors?|tiers\/([^/]*)).(png|svg)$/)) {
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
  if (url.pathname.match(/^\/(widgets|([^/]*)\/(donate|contribute)\/button.*)/)) {
    return 'frontend';
  }
  // images
  if (url.pathname.match(/\.(png|jpg)$/)) {
    return 'images';
  }
  // default
  return 'frontend';
}

function addResponseHeaders(response, headers) {
  const originalHeaders = {};
  for (const pair of response.headers) {
    originalHeaders[pair[0]] = pair[1];
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: Object.assign(headers, originalHeaders)
  });
}

async function handleOpenCollective(request) {
  const url = new URL(request.url);
  const environment = getEnvironment(url);
  const backend = getBackend(url);
  const headers = {};
  if (backend) {
    responseHeaders['oc-backend'] = backend;
  }
  if (environment) {
    responseHeaders['oc-environment'] = environment;
  }
  let response;
  if (domains[environment] && domains[environment][backend]) {
    url.hostname = domains[environment][backend];
    response = await fetch(url, request);
  } else {
    response = await fetch(request);
  }
  if (Object.keys(headers).length) {
    response = addResponseHeaders(response, headers);
  }
  return response
}

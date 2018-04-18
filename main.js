const domains = {
  'production': {
    'website': 'opencollective-prod-website.herokuapp.com',
    'frontend': 'oc-prod-frontend.herokuapp.com',
    'images': 'oc-prod-image-server.herokuapp.com'
  },
  'staging': {
    'website': 'opencollective-staging-website.herokuapp.com',
    'frontend': 'oc-staging-frontend.herokuapp.com',
    'images': 'oc-staging-image-server.herokuapp.com'
  }
};

addEventListener('fetch', event => {
  event.respondWith(handleOpenCollective(event.request))
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
  if (url.pathname === '/') {
    return 'website';
  }
  if (url.pathname.indexOf('/proxy/') === 0) {
    return 'images';
  }
  if (url.pathname.match(/^\/(faq|learn-more|discover|about)$/)) {
    return 'website';
  }
  if (url.pathname.match(/(invoice\.pdf|invoice\.html|banner.md)$/)) {
    return 'website';
  }
  if (url.pathname.match(/^\/(opensource|github)\/apply/)) {
    return 'website';
  }
  if (url.pathname.match(/\/members\/.+\.json$/)) {
    return 'frontend';
  }
  if (url.pathname.match(/\.json$/)) {
    return 'frontend';
  }
  if (url.pathname.match(/^\/public\//)) {
    return 'website';
  }
  if (url.pathname.match(/^\/static\/images\/.*/)) {
    return 'frontend';
  }
  if (url.pathname.match(/^\/([^/]*)\/logo\.(jpg|png|svg|txt)/)) {
    return 'images';
  }
  // github badge
  if (url.pathname.match(/\/badge.(png|svg)$/)) {
    return 'images';
  }
  // e.g. /mochajs/sponsor/0/avatar.svg
  if (url.pathname.match(/\/avatar(\.(png|svg|jpg))?$/)) {
    return 'images';
  }
  // e.g. /mochajs/sponsor/0/website
  if (url.pathname.match(/\/website$/)) {
    return 'frontend';
  }
  // e.g. /mochajs/backers.svg or /gulpjs/tiers/individual.svg
  if (url.pathname.match(/^\/([^/]*)\/(backers?|sponsors?|tiers\/([^/]*)).(png|svg)$/)) {
    return 'images';
  }
  // mosaic of github contributors
  if (url.pathname.match(/\/contributors\.svg$/)) {
    return 'images';
  }
  if (url.pathname.match(/^\/(static|_next|tos|privacypolicy)/)) {
    return 'frontend';
  }
  if (url.pathname.match(/^\/(widgets|([^/]*)\/(donate|contribute)\/button.*)/)) {
    return 'frontend';
  }
  if (url.pathname.match(/^\.(png|jpg)$/)) {
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

function shouldTerminateTls() {
  return false;
}

async function handleOpenCollective(request) {
  const url = new URL(request.url);
  const environment = getEnvironment(url);
  const backend = getBackend(url);
  const terminateTls = shouldTerminateTls();
  const headers = {};
  if (backend) {
    headers['OC-Backend'] = backend;
  }
  if (environment) {
    headers['OC-Environment'] = environment;
  }
  if (domains[environment] && domains[environment][backend]) {
    request.hostname = domains[environment][backend];
  }
  if (terminateTls) {
    request.protocol = 'http';
  }
  let response = await fetch(request);
  if (Object.keys(headers).length) {
    response = addResponseHeaders(response, headers);
  }
  return response
}

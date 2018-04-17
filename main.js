let log = () => {};

// log = console.log;

const website_hostname = 'opencollective-prod-website.herokuapp.com';
const images_hostname = 'oc-prod-image-server.herokuapp.com';

addEventListener('fetch', event => {
  event.respondWith(handleOpenCollective(event.request))
})

async function handleOpenCollective(request) {
  const url = new URL(request.url);
  let response;
  if (url.pathname === '/') {
    log(url.pathname, '-> website');
    request.protocol = 'http';
    request.hostname = website_hostname;
    response = await fetch(request);
  } else if (url.pathname.indexOf('/proxy') === 0) {
    log(url.pathname, '-> images');
    request.protocol = 'http';
    request.hostname = images_hostname;
    response = await fetch(request);
  } else {
    log(url.pathname, '-> default');
    request.protocol = 'http';
    response = await fetch(request);
  }
  return response
}

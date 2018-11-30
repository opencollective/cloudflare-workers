# Cloudflare Workers

This is the service worker living _at the Edge_ for the Open Collective Cloudflare infrastructure.

## Development

Edit `main.js` with any changes, then run `npm test` in the command line to check the changes against the linter and tests.

Update the tests in `test/main-unit.js`. See the [`@hipsterbrown/cloudflare-worker-mock`](https://github.com/HipsterBrown/service-workers/tree/master/packages/service-worker-mock) docs for usage of that library.

## Deployment

Make a copy of the default environment variable file:

```
cp .env.default .env
```

Update the `.env` file with the correct values for those environment variables.

Then give permission to `deploy.sh` and run the script:

```
chmod +x deploy.sh
./deploy.sh
```

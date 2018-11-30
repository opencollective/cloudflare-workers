const { expect }  = require('chai');
const sinon = require('sinon');
const makeServiceWorkerEnv = require('@hipsterbrown/cloudflare-worker-mock');

describe('service-worker main', () => {
  before(() => {
    Object.assign(
      global,
      makeServiceWorkerEnv(),
      { fetch: sinon.stub() },
    );
    require('../main.js');
  });

  afterEach(() => {
    global.fetch.reset();
  });

  it('should add "fetch" listener', () => {
    expect(self.listeners['fetch']).to.not.be.undefined;
    expect(self.listeners['fetch'].length).to.equal(1);
  });

  it('should redirect to staging', async () => {
    global.fetch.resolves({ headers: new Map() });
    const stagingRequest = new Request('https://staging.opencollective.com/');
    const response = await self.trigger('fetch', stagingRequest);

    expect(response).to.not.be.undefined;
    expect(response.headers.get('oc-environment')).to.equal('staging');
  });

  it('should redirect to production', async () => {
    global.fetch.resolves({ headers: new Map() });
    const productionRequest = new Request('https://opencollective.com/');
    const response = await self.trigger('fetch', productionRequest);

    expect(response).to.not.be.undefined;
    expect(response.headers.get('oc-environment')).to.equal('production');
  });
});

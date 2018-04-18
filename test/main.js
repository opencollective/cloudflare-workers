const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const expect = chai.expect;

const scheme = 'https';
const domain = 'staging.opencollective.com';

describe('"index" route', function() {
  it('should return "website" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'website');
        done();
      });

  });

});

describe('"proxy" route', function() {
  it('should return "images" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/proxy/images/?src=https%3A%2F%2Fopencollective-production.s3-us-west-1.amazonaws.com%2F8c6499b0-99ab-11e7-80ca-f5c3a43ab43f.png&height=36')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'images');
        done();
      });

  });

});

describe('"website-static" route', function() {
  it('should return "website" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/faq')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'website');
        done();
      });

  });

});

describe('"invoice" route', function() {
  it('should return "website" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/material-ui/transactions/12845f09-2845-4de1-9a6b-606af73e702f/invoice.pdf')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'website');
        done();
      });

  });

});

describe('"apply" route', function() {
  it('should return "website" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/opensource/apply')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'website');
        done();
      });

  });

});

describe('"members" route', function() {
  it('should return "frontend" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/radarr/members/users.json')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'frontend');
        done();
      });

  });

});

describe('"json" route', function() {
  it('should return "frontend" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/nuxtjs.json')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'frontend');
        done();
      });

  });

});

describe('"public" route', function() {
  it('should return "website" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/public/images/home-backers.svg')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'website');
        done();
      });

  });

});

describe('"static-images" route', function() {
  it('should return "frontend" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/static/images/become_backer.svg')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'frontend');
        done();
      });

  });

});

describe('"logo" route', function() {
  it('should return "images" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/react-native-elements/logo.txt')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'images');
        done();
      });

  });

});

describe('"badge" route', function() {
  it('should return "images" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/webpack/backers/badge.svg')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'images');
        done();
      });

  });

});

describe('"avatar" route', function() {
  it('should return "images" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/mochajs/sponsor/0/avatar.svg')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'images');
        done();
      });

  });

});

describe('"website" route', function() {
  it('should return "frontend" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/mochajs/sponsor/0/website')
      .redirects(0)
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'frontend');
        done();
      });

  });

});

describe('"contributors" route', function() {
  it('should return "images" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/apollo-universal-starter-kit/contributors.svg?width=890')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'images');
        done();
      });

  });

});


describe('"frontend-static" route', function() {
  it('should return "frontend" backend for "privacypolicy"', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/privacypolicy')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'frontend');
        done();
      });

  });

  it('should return "frontend" backend for "fonts"', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/static/fonts/montserrat/lato-regular.ttf')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'frontend');
        done();
      });

  });

});


describe('"button" route', function() {
  it('should return "frontend" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/webpack/donate/button@2x.png?color=blue')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'frontend');
        done();
      });

  });

});

describe('"images" route', function() {
  it('should return "images" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/apple-touch-icon.png')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'images');
        done();
      });

  });

});

describe('"default" route', function() {
  it('should return "frontend" backend', function(done) {

    chai.request(`${scheme}://${domain}`)
      .get('/yeoman')
      .end(function(err, res) {
        expect(res).to.have.header('oc-backend', 'frontend');
        done();
      });

  });

});

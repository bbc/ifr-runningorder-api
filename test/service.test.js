"use strict"

var RunningOrderApiMicroService = require('../index');
var request = require('request');
var pkginfo = require('pkginfo')(module, ["name", "version"]);
var chai = require("chai");
var should = chai.should();
var nconf = require('nconf');
const httpPort = 4323;

const testName = module.exports.name
const testVersion = module.exports.version

var svc = new RunningOrderApiMicroService(testName, testVersion, {noLog: true, httpPort: httpPort});

svc.setup()
describe(module.exports.name, function () {

    before(function () {
        console.log("RLW 1")
        svc.run()
        console.log("RLW 2")
    })

    after(function () {
        svc.stop();
    })

    it("responds to /version", function (done) {
        request.get('http://localhost:' + httpPort + '/version', function (err, res, body) {

            res.statusCode.should.equal(200)
            var parsedBody = JSON.parse(body)
            parsedBody.version.should.equal(testVersion)
            parsedBody['service'].should.equal(testName)
            done();
        })
    })

    it("responds to /ro/b09drjf8", function (done) {
        request.get('http://localhost:' + httpPort + '/ro/b09drjf8', function (err, res, body) {
            res.statusCode.should.equal(200);
            // grr the mime lookup used by restify inside its serveStatic module is broken, and you cant explicitly
            // specify the Content-Type for static restify resources.  So while we're serving static files we'll just
            // have to  parse the JSON manually instead of using something like res.body.should.have.property('pid');
            var parsedBody = JSON.parse(body)
            parsedBody['pid'].should.equal('b09drjf8')
            done();
        })
    })

    it("throws 404 error on nonexistant endpoint", function (done) {
        request.get('http://localhost:' + httpPort + '/blardgkjflkjahdflkjhsadflkjhasd', function (err, res, body) {
            res.statusCode.should.equal(404)
            done();
        })
    })
    // extend this as you develop new functionality!
})

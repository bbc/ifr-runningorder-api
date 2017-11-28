"use strict"

var WireframeMicroService = require('../index')
var request = require('request');
var pkginfo = require('pkginfo')(module, ["name","version"]);
var chai    = require("chai");
var should = chai.should();
var nconf = require('nconf')
const httpPort = 5555

const testName = module.exports.name
const testVersion = module.exports.version

var wireframeMicroService = new WireframeMicroService(testName,testVersion,{noLog: true   , httpPort: httpPort});

wireframeMicroService.setup()
describe(module.exports.name, function () {

   before(function () {
      wireframeMicroService.run()
   })

   after(function () {
      wireframeMicroService.stop();
   })

  it("responds to /version", function (done) {
     request.get('http://localhost:' + httpPort + '/version', function (err, res, body){

        res.statusCode.should.equal(200)
        var parsedBody = JSON.parse(body)
        parsedBody.version.should.equal(testVersion)
        parsedBody['service'].should.equal(testName)
         done();
      })
   })

   it("responds to /test", function (done) {
      request.get('http://localhost:' + httpPort + '/test', function (err, res, body){
         res.statusCode.should.equal(200)
         body.should.equal('"tested successfully"')
         done();
      })
   })

   it("throws 404 error on nonexistant endpoint", function (done) {
      request.get('http://localhost:' + httpPort + '/blardgkjflkjahdflkjhsadflkjhasd', function (err, res, body){
         res.statusCode.should.equal(404)
         done();
      })
   })
   // extend this as you develop new functionality!
})

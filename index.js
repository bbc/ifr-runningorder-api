"use strict";
var pkginfo = require('pkginfo')(module, ["name", "version"]);
var moment = require('moment')
var request = require('request')
var restify = require('restify')
var MicroService = require('ifr-microservice')
var RunningOrderApiMicroService = function (service_name, service_version, options) {
    this.service = new MicroService(service_name, service_version, options);
}

RunningOrderApiMicroService.prototype.setup = function () {
    var self = this

    // GET a running order by pid
    console.log('RLW dirname is '+ __dirname);
    this.service.server.get('/ro/b09drjf8', restify.plugins.serveStatic({
            appendRequestPath: false,
            directory: './public/json',
            file: 'b09drjf8.json'
        })
);

}

RunningOrderApiMicroService.prototype.run = function () {
    var self = this
    this.service.start(function (err) {
        if (err) {
            console.log("Couldn't start service: " + err)
            process.exit(5)
        }
    })
}

RunningOrderApiMicroService.prototype.stop = function () {
    //do some tidy-up/close connections etc when app is closing
    var self = this
    self.service.stop()
}

if (require.main === module) {
    // start a barebones service for testing purposes
    var ms = new RunningOrderApiMicroService('runningorder-api', '0.0.1');
    ms.setup()
    process.on('SIGINT', function () {
        ms.stop();
        process.exit(0)
    })
    ms.run()
}

module.exports = RunningOrderApiMicroService;

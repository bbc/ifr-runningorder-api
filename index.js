"use strict";
var pkginfo = require('pkginfo')(module, ["name", "version"]);
var moment = require('moment');
var request = require('request');
var restify = require('restify');
const mongoose = require('mongoose');
const RunningOrder = require('./models/runningOrder');
var MicroService = require('ifr-microservice');

var RunningOrderApiMicroService = function (service_name, service_version, options) {
    this.service = new MicroService(service_name, service_version, options);
};

RunningOrderApiMicroService.prototype.setup = function () {
    var self = this;

    // establish connection to mongodb
    mongoose.Promise = global.Promise;
    mongoose.connect(this.service.nconf.get('db:uri'), { useMongoClient: true });

    const db = mongoose.connection;

    db.on('error', (err) => {
        console.error(err);
        process.exit(1);
    });

    db.once('open', () => {
        console.log(`Database connected`);
    });

    // GET a static running order
    this.service.server.get('/static/ro/b09drjf8', restify.plugins.serveStatic({
            appendRequestPath: false,
            directory: './public/json',
            file: 'b09drjf8.json'
    }));

    // GET all running orders
    this.service.server.get('/ros', (req, res, next) => {
        RunningOrder.apiQuery(req.params, function(err, docs) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }

            res.send(docs);
            next();
        });
    });

    // GET a running order by pid
    this.service.server.get('/ro/:pid', (req, res, next) => {
        RunningOrder.findOne({ pid: req.params.pid }, function(err, doc) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }

            res.send(doc);
            next();
        });
    });

    //create a new running order
    this.service.server.post('/ro', (req, res, next) => {
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'"),
            );
        }

        let data = req.body || {};

        let todo = new RunningOrder(data);
        todo.save(function(err) {
            if (err) {
                console.error(err);
                return next(new errors.InternalError(err.message));
                next();
            }

            res.send(201);
            next();
        });
    });


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

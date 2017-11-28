"use strict";
var pkginfo = require('pkginfo')(module, ["name","version"]);
var moment  = require('moment')
var request = require('request')
var MicroService = require('ifr-microservice')
var ExampleMicroService = function (service_name, service_version, options)
{
    this.service = new MicroService(service_name, service_version, options);
}

ExampleMicroService.prototype.setup = function () {
   var self = this

   // logging
   self.service.log.info("Log a message");

   // a REST endpoint
   this.service.server.get('/hello', function (req,res, next) {
      var result = "Hello world"
      res.writeHead(200, {
          'Content-Length': Buffer.byteLength(result),
           'Content-Type': 'text/html'
      });
      res.write(result)

      //alternatively, for json responses
      //res.writeHead(200, {
      //   'Content-Length': Buffer.byteLength(result.stringify),
      //   'Content-Type': 'text/html'
      // });
      // res.json(200, resultInJson);

      next();
   });

   //connect directly to a queue
   self.service.on('stompConnected', function () {
      self.service.subscribe('/topic/playout', function (message){
         if (message && message.take)
         {
            // if it's a Now Playing message send it to MOR in JSON format
            var nowPlaying = [ {
               'Artist': message.take.AssetInfo[0].GENE_PERFORMERS[0],
               'Title': message.take.AssetInfo[0].GENE_TITLE[0],
               'StartTime': moment(message.take.OACTL_START_TIME[0],"DD-MMM-YYYY HH:mm:ss.SSSS").format("YYYY-MM-DDTHH:mm:ss.SSSSZ"), //from dira: 23-JAN-2017 10:32:15.6910
               'DurationSeconds': Math.round(message.take.AssetInfo[0].GENE_AUDIO_LENGTH[0]/1000),
               'Type': 'Song',
               'Position': "0",
               'StationGUID': "66c58789-c605-454a-8270-a2badc272e22"
            } ]

            // make an HTTP request to another service
            request({
                // get an value out of config
                url: self.service.nconf.get('mor:nowPlaying'),
                method: "POST",
                json: nowPlaying,
             }, function (error, response, body) {
                if (error)
                {
                   if (response) {
                     self.service.log.error("Couldnt send to MOR: ", error, response.statusCode, response.statusText)
                   } else {
                     self.service.log.error("Couldn't send to MOR: ", error)
                   }
                   return
                }
             })
         }
      })
   })
}

ExampleMicroService.prototype.run = function () {
   var self = this
   this.service.start(function (err) {
      if (err)
      {
         console.log("Couldn't start service: " + err)
         process.exit(5)
      }
   })
}

ExampleMicroService.prototype.stop = function () {
   //do some tidy-up/close connections etc when app is closing
   var self = this
   self.service.stop()
}

if (require.main === module) {
    // start a barebones service for testing purposes
    var myMicroService = new ExampleMicroService('example','0.0.1');
    myMicroService.setup()
    process.on('SIGINT', function () {
      myMicroService.stop();
      process.exit(0)
   })
    myMicroService.run()
}

module.exports = ExampleMicroService;

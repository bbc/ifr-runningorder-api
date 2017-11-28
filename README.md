# Internet Fit Radio
## Running Order API

An API that interfaces with the running order database, the [API of studio events](https://github.com/bbc/ifr-studio-events), and other production systems such as Proteus.

This service should run on its own, and pass all unit tests. Run it by executing

    npm start

### Data model
The underlying data model is based on R&D's proposed [Object Based Media Schema](https://github.com/bbc/object-based-media-schema)

### Config files
In the `conf` directory, there are two config files (JSON) which can pass details on to the microservice.  `global.json` is designed to be where any configuration that should be the same for all instance of this service should live - `user.json` is where any instance specific configuration should go.  User config should override global config.  We use the [nconf](https://www.npmjs.com/package/nconf) module within the service to handle all of this.  

### Logging

Logging is handled by [bunyan](https://www.npmjs.com/package/bunyan), as well as the [bunyan logstash plugin](https://www.npmjs.com/package/bunyan-logstash-tcp), (if the `logstash` key is defined within the configuration).

The logger uses the module name (from package.json) and version.

### Tests

We're using [mocha](https://mochajs.org/), [chai](http://chaijs.com/) and [sinon](http://sinonjs.org/) to perform unit testing. All tests should run by running `npm test`.

### REST API
#### Get a running order for a single pid
```GET /ro/{pid}```
##### Parameters
None
'use strict';

var SwaggerExpress = require('swagger-express-mw');
var express = require('express')
  , http = require('http')
  , app = express()
  , server = http.createServer(app)

module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  server.listen(8001,'192.168.21.55');


  // if (swaggerExpress.runner.swagger.paths['/api']) {
  //   console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  // }
});

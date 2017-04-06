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

  var port = process.env.PORT || 8080;
  server.listen(8000,'127.0.0.1',function(){
    server.close(function(){
      server.listen(8001,'169.254.208.124');
    })
  })

  // if (swaggerExpress.runner.swagger.paths['/api']) {
  //   console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  // }
});

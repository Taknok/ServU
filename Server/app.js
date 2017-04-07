'use strict';

var SwaggerExpress = require('swagger-express-mw');
var session = require('cookie-session');
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var methodOverride = require('method-override');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

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


  app.use('/public', express.static(__dirname + '/public'));
  app.use('/node_modules', express.static(__dirname + '../node_modules'));
  app.set('view engine', 'ejs');
  /* On utilise les sessions */
  app.use(session({secret: 'todotopsecret'}));
  app.use(express.static(__dirname));
  app.use(methodOverride('_method'));

  console.log("serveur bien lancé");
  /* On redirige vers la todolist si la page demandée n'est pas trouvée */

  var username = "Pad";
  var lastname = "Germain";
  var firstname = "Alexandre";
  var password = "mdp";
  var sonne = true;

  var user_session = new Object();
  user_session.username = username;
  user_session.lastname = lastname;
  user_session.firstname = firstname;

  /** Routes */
  app.get('/', function(req, res){
      console.log("slaut");
      if (typeof(req.session.info_user) != 'undefined') {
          req.session.info_user = user_session;
          res.render('index', {
              username: user_session.username,
              lastname: user_session.lastname,
              firstname: user_session.firstname,
              session: false});
      }
      else{
          res.render('index', {
              session: true,
              username: "test"});
      }
  });

  app.get('/user/:username', function (req, res){
      res.render('gestion', {
          username: user_session.username,
          lastname: user_session.lastname,
          firstname: user_session.firstname});
      console.log(user_session.username);
  });

  app.get('*', function(req, res) {
      res.send("erreur 404");
  });


  app.put('/user/:username',urlencodedParser, function(req, res) {
     if (req.body.change_prenom != undefined && req.body.change_nom != undefined && req.body.change_prenom != ''
          && req.body.change_nom != ''){
          lastname = req.body.change_prenom;
          firstname = req.body.change_nom;
      }
      if (req.body.password != undefined && req.body.password2 != undefined && req.body.password2 == req.body.password){
          password = req.body.password;
      }
      console.log(req.body);
      res.redirect('/user');
  });

  app.post('/api/users',urlencodedParser, function(req, res) {
      console.log(req.body);
      if (req.body.username != '' && req.body.prenom != '' && req.body.nom != ''
          && req.body.password != '' && req.body.password2 != '' && req.body.password2 == req.body.password
          && req.body.email != ''){
          user_session.username = req.body.username;
          user_session.lastname = req.body.nom;
          user_session.firstname = req.body.prenom;
          user_session.email = req.body.email;
          user_session.password  = req.body.password;
          res.redirect('/user/' + req.body.username);
      }
      else{
          res.redirect('/');
      }
  });


  server.listen(3000,'127.0.0.1');


  // if (swaggerExpress.runner.swagger.paths['/api']) {
  //   console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  // }
});

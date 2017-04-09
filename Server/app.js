'use strict';

var config = {
	appRoot: __dirname // required config
};

try {
	process.chdir(config.appRoot); //on se place au bon endroit pour executer le processus
}
catch (err) {
	console.log('chdir: ' + err);
}


var SwaggerExpress = require('swagger-express-mw');
var session = require('express-session');
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var methodOverride = require('method-override');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var request = require('request');

var express = require('express')
    , http = require('http')
    , app = express()
    , server = http.createServer(app);

module.exports = app; // for testing



/* On utilise les sessions */
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname));
app.use(methodOverride('_method'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

SwaggerExpress.create(config, function(err, swaggerExpress) {

    if (err) { throw err; }

    // install middleware
    swaggerExpress.register(app);

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
    user_session.email = "salut ca va ?";

    /** Routes */
    app.get('/', function(req, res){
        if (typeof(req.session.username) != 'undefined') {
            res.render('index', {
                username: user_session.username,
                lastname: user_session.lastname,
                firstname: user_session.firstname,
                session: true});
        }
        else{
            res.render('index', {
                session: false,
                username: "test"});
        }
    });

	app.get('/users/:username', function (req, res){
        if (typeof(req.session.username) != 'undefined') {
            res.render('gestion', {
                username: user_session.username,
                lastname: user_session.lastname,
                firstname: user_session.firstname,
                session: true});
        }
        else{
            res.send("<h1>UNKNOW USER</h1>");
        }
    });

    app.get('/users/login', function (req, res){
        if(res.reponce == true){
            res.render('gestion', {
                username: user_session.username,
                lastname: user_session.lastname,
                firstname: user_session.firstname});
        }
        else {
            res.render('index', {
                username: user_session.username,
                lastname: user_session.lastname,
                firstname: user_session.firstname});
        }
    });

    app.get('*', function(req, res) {
        res.send("erreur 404");
    });


    app.put('/users/:username',urlencodedParser, function(req, res) {
        if (req.body.change_prenom != undefined && req.body.change_nom != undefined && req.body.change_prenom != ''
            && req.body.change_nom != ''){
            lastname = req.body.change_prenom;
            firstname = req.body.change_nom;
        }
        if (req.body.password != undefined && req.body.password2 != undefined && req.body.password2 == req.body.password){
            password = req.body.password;
        }
        console.log(req.body);
        res.redirect('/users');
    });
	
	app.post('/signUp', function(req, res) {
        request.post({ url : 'http://127.0.0.1:3000/api/users', form : req.body }, function(err,httpResponse,body){
			if (err){
				console.error(err);
				res.redirect('/');
			}
			
			if (httpResponse.statusCode == "201"){
				console.log(httpResponse.statusCode);
				
				req.session.username = req.body.username;
				req.session.lastname = req.body.lastname;
				req.session.firstname = req.body.firstname;
				
				user_session = req.session; //bcp de changement de var non ? on peut pas garder req.session ? 
				
				
				
				// SUPPR APRES MOCK (FAKE) DEVICE
				var device = {
				  "name": "dev",
				  "manufacturer": "sam",
				  "model": "1",
				  "platform": "android",
				  "version": "1.0.0",
				  "serial": "1",
				  "uuid": "1"
				}
				var apiUrl = 'http://127.0.0.1:3000/api/users/' + user_session.username + '/devices'
				request.post({ url : apiUrl , form : device },function(err,httpResponse,body){
					console.log("error :",err);
					console.log("body :",body);
					console.log(httpResponse.statusCode);
				});
				
				
				
				res.redirect('/users/' + req.body.username);
			}
			
		});
    })

    /*
    app.post('/users/:username/devices/:uuid/actions',urlencodedParser, function(req, res, next) {
        console.log(req.body);
        next();
    });

    /*
     app.post('/api/users',urlencodedParser, function(req, res){
     console.log(req.body);
     if (req.body.username != '' && req.body.firstname != '' && req.body.lastname != ''
     && req.body.password != '' && req.body.password2 != '' && req.body.email != ''){
     user_session.username = req.body.username;
     user_session.lastname = req.body.lastname;
     user_session.firstname = req.body.firstname;
     user_session.email = req.body.email;
     user_session.password  = req.body.password;
     res.redirect('api/users/' + req.body.username);
     }
     else{
     res.redirect('/');
     }
     });
     */

    //server.listen(8001,'192.168.21.55');
    server.listen(3000,'127.0.0.1');

    // if (swaggerExpress.runner.swagger.paths['/api']) {
    //   console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
    // }
});

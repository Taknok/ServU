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


    app.get('/api/users/login', function (req, res){
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


    app.put('/api/users/:username',urlencodedParser, function(req, res) {
        if (req.body.change_prenom != undefined && req.body.change_nom != undefined && req.body.change_prenom != ''
            && req.body.change_nom != ''){
            lastname = req.body.change_prenom;
            firstname = req.body.change_nom;
        }
        if (req.body.password != undefined && req.body.password2 != undefined && req.body.password2 == req.body.password){
            password = req.body.password;
        }
        console.log(req.body);
        res.redirect('/api/users');
    });

    app.post('/users/:username/devices/:uuid/action',urlencodedParser, function(req, res, next) {
        console.log(req.body);
        next();
    })

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

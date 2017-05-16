var express = require('express'),
    http = require('http'),
    app = express(),
    request = require('request'),
    server = http.createServer(app),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    session = require('express-session');
var urlencodedParser =  bodyParser.urlencoded({ extended: false });

// ADRESSE ET PORT DU SERVER
var adresse = '127.0.0.1';
var portSite = 3001;
var portApi = 3000;
var token;

/* On utilise les sessions */
app.use(session({
    secret: 'secret',
    saveUninitialized: true
}))

    .use('/node_modules', express.static(__dirname + '/node_modules'))
    .use(express.static(__dirname))
    .set('view engine', 'ejs')

    .use(methodOverride('_method'))
    .use( bodyParser.json() )      // to support JSON-encoded bodies
    .use(bodyParser.urlencoded({extended: false})) // to support URL-encoded bodies

    /** Routes */

    //Default Route
    .get('/', function(req, res){
        if (typeof(req.session.username) !== 'undefined') {
            res.render('index', {
                username: req.body.username,
                lastname: req.body.lastname,
                firstname: req.body.firstname,
                session: true});
        }
        else{

            /*
            res.render('gestion', {
                username: req.body.username,
                lastname: req.body.lastname,
                firstname: req.body.firstname,
                session: true}); */
             res.render('index', {
             session: false,
             username: "test"});
        }
    })
    // Get the username
    .get('/users/:username', function (req, res) {
        if (req.params.username == '') {
            res.redirect('/');
        }
        if (req.session.username != req.params.username) {
            res.redirect('/');
        }
        request.get({
            url: 'http://' + adresse + ':' + portApi + '/api/users/' + req.params.username,
            headers: {'x-access-token':token},
            json: true,
            body : {username: req.params.username}
        }, function (err, response, body) {
            if (err) {
                console.error(err);
                res.redirect('/');
            }
            switch(response.statusCode){
                case 200:
                    req.session.lastname = response.body.lastname;
                    req.session.firstname = response.body.firstname;
                    res.render('gestion', {
                        username: req.session.username,
                        lastname: req.session.lastname,
                        firstname: req.session.firstname
                    });
                    break;
                case 401:
                    res.redirect('/');
                    break;
                case 403:
                    res.send("<h1>Forbidden</h1>");
                    break;
                case 404:
                    res.send("<h1>User Not Found</h1>");
                    break;
                default :
                    res.send("<h1>Unknow Error</h1>");
            }
        })
    })

    .put('/users/:username',urlencodedParser, function(req, res) {
        var dataChanged,
            lastname = req.session.lastname,
            firstname = req.session.firstname;
        // Premiere partie du formulaire
        if (req.body.lastname != undefined && req.body.lastname != undefined && req.body.firstname != ''
            && req.body.firstname != ''){
            lastname = req.body.lastname;
            firstname = req.body.firstname;
            dataChanged = {lastname : lastname,firstname : firstname};
        }
        //Deuxieme partie du formulaire
        if (req.body.password != undefined && req.body.password2 != undefined && req.body.password2 == req.body.password){
            password = req.body.password;
            dataChanged = {password : password};
        }
        request.put({
            url: 'http://' + adresse + ':' + portApi + '/api/users/' + req.params.username,
            headers: {'x-access-token':token},
            json: true,
            body : dataChanged}, function (err, response, body) {
            if (err) {
                console.error(err);
                res.redirect('/');
            }
            switch (response.statusCode) {
                case 204:
                    req.session.lastname = lastname;
                    req.session.firstname = firstname;
                    res.render('gestion', {
                        username: req.session.username,
                        lastname: req.session.lastname,
                        firstname: req.session.firstname
                    });
                    break;
                case 400:
                    res.send("<h1>Wrong Format</h1>");
                    break;
                case 401:
                    res.send("<h1>Unauthorized</h1>");
                    break;
                case 403:
                    res.send("<h1>Forbidden</h1>");
                    break;
                case 404:
                    res.send("<h1>User not found</h1>");
                    break;
                case 409:
                    res.send("<h1>Another user has the same username</h1>");
                    break;
                default :
                    res.send("<h1>Unknow Error</h1>");
            }
        });
        res.redirect('/users');
    })
    .post('/signUp', function(req, res) {
        console.log(req.body);
        if(req.body.username != undefined && req.body.lastname != undefined && req.body.firstname != undefined && req.body.email != undefined && req.body.password != undefined){
            request.post({
                url: 'http://' + adresse + ':' + portApi + '/api/users',
                json: true,
                body: {
                    username: req.body.username,
                    lastname : req.body.lastname,
                    firstname : req.body.firstname,
                    email : req.body.email,
                    password: req.body.password
                }}, function (err, response, body) {

                if (err) {
                    console.error(err);
                    res.redirect('/');
                }
                switch (response.statusCode) {
                    case 201:
                        req.session.username = req.body.username;
                        req.session.lastname = req.body.lastname;
                        req.session.firstname = req.body.firstname;
                        login(req,res);
                        break;
                    case 400:
                        res.send("<h1>Wrong Format</h1>");
                        break;
                    case 409:
                        res.send("<h1>Another user has the same username</h1>");
                        break;
                    default :
                        res.send("<h1>Unknow Error</h1>");
                }
            });
        }})

    .post('/signIn', function(req, res) {
        login(req,res);
    })
    .get('/logout', function(req, res) {
        req.session.destroy();
        res.redirect('/');
    })

    .get('*', function(req, res) {
        res.send("erreur 404");
    });

server.listen(3001,adresse);
console.log("Serveur lancé sur", adresse," le port : 3001");

var login = function(req, res){
    request.post({
        url: 'http://' + adresse + ':' + portApi + '/api/login',
        json: true,
        body: {
            username: req.body.username,
            password: req.body.password
        }}, function (err, response, body) {
        if (err) {
            console.error(err);
            res.redirect('/');
        }
        console.log(response.statusCode);
        switch (response.statusCode) {
            case 200:
                token = body.token;
                req.session.username = req.body.username;
                res.redirect('/users/' + req.body.username);
                break;
            case 400:
                res.send("<h1>Wrong Format</h1>");
                break;
            case 401:
                res.send("<h1>Unauthorized</h1>");
                break;
            default :
                res.send("<h1>Unknow Error</h1>");
        }
    });
};
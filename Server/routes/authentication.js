const jwt = require('jsonwebtoken');
const config = require('../configToken');
const error = require('../error');
const users = require('../database/users');
const express = require('express');
const mail = require('../sendEmail');

function createToken(username) {
    let payload = {
        username: username
    };
    return jwt.sign(payload, config.secret, {expiresIn: "7 days"}); //604800000 correspond à 7 jours en ms
}

function decodeToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                reject(err.name);
            } else {
                resolve(decoded.username);
            }
        })
    });
}

function checkTokenMiddleware(req, res, next) {
    let token = req.headers['x-access-token'];
    if (token !== undefined) {
        decodeToken(token)
            .then(username => {
                req.decodedUsername = username;
                next();
            })
            .catch(err => {
                next(new error.error(401, 'Unauthorized', err))
            })
    } else {
        next(new error.error(401, "Unauthorized", "No token provided"))
    }
}
function newPassword(nbcar) {
    const ListeCar = new Array("A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9");
    let Chaine ='';
    for(i = 0; i < nbcar; i++)
    {
        Chaine = Chaine + ListeCar[Math.floor(Math.random()*ListeCar.length)];
    }
    return Chaine;
}


let router = express.Router();

router.post('/login', function (req, res, next) {
    let credentials = req.body;
    if (credentials.username !== undefined && credentials.password !== undefined) {
        users.logIn(credentials.username, credentials.password)
            .then(authenticated => {
                if (authenticated === true) {
                    let token = {
                        token: createToken(credentials.username)
                    };
                    res.status(200).json(token);
                } else {
                    next(new error.error(401, "Unauthorized"));
                }
            })
            .catch(err => {
                next(err)
            })
    } else {
        next(new error.error(400, "Bad request", "Missing username or password"));
    }
});

router.post('/resetPassword', function (req, res, next) {
    let credentials = req.body;
    let pass = {};
    let password;
    if (credentials.username !== undefined && credentials.email !== undefined) {
        users.resetPassword(credentials.username, credentials.email)
            .then(authenticated => {
                return new Promise((resolve,reject) => {
                    if (authenticated === true) {
                        password = newPassword(8);
                        pass.password = password;
                        resolve();
                    } else {
                        reject(error.error(401, "Unauthorized"));
                    }
                })
            })
            .then(() => users.updateUser(credentials.username, pass))
            .then(updated => {
                return new Promise((resolve, reject) => {
                    if (!updated) {
                        reject(error.error(401, "Unauthorized"));
                    } else {
                        mail.sendMailPassword(credentials.username,credentials.email, password);
                        res.status(200).end();
                        resolve();
                    }
                })
            })
            .catch(err => {
                next(err)
            })
    } else {
        next(error.error(400, "Bad request", "Missing username or email"));
    }
});

module.exports = {
    decodeToken,
    checkTokenMiddleware,
    router
};
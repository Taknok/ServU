const jwt = require('jsonwebtoken');
const config = require('../configToken');
const error = require('../error');
const users = require('../database/users');
const express = require('express');


function createToken(username) {
    let payload = {
        username: username
    };
    return jwt.sign(payload, config.secret, {expiresIn: "7 days"}); //604800000 correspond à 7 jours en ms
}

function checkToken(req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.headers['x-access-token'];
    // decode token
    if (token !== undefined) {
        // verifies secret and checks exp
        //utilisé le salt comme clé secrete et utiliser décode avant verify afin de recuperer le salt dans la base de donnée.
        jwt.verify(token, config.secret, function (err, decoded) {
            if (!err) {
                // if everything is good, save to request for use in other routes
                req.decodedUsername = decoded.username;
                next();
            }
            else if (err.name === 'TokenExpiredError') {
                next(new error.error(401, 'TokenExpiredError', err.expiredAt));
            }
            else {
                next(new error.error(401, 'JsonWebTokenError', err.message));
            }
        });

    } else {
        console.log("pas de token");
        next(new error.error(401, "Unauthorized", "No token provided"))
    }
}

let router = express.Router();

router.post('/login', function (req, res, next) {
    console.log(req.body);
    let credentials = req.body;
    if (credentials.username !== undefined && credentials.password !== undefined) {
        users.logIn(credentials.username, credentials.password)
            .then(authenticated => {
                console.log(authenticated);
                if (authenticated === true) {
                    let token = {
                        token: createToken(credentials.username)
                    };
                    res.status(200).json(token);
                } else {
                    next(new error.error(404, "Unauthorized"));
                }
            })
            .catch(err => {
                next(err)
            })
    } else {
        next(new error.error(400, "Bad request", "Missing username or password"));
    }
});

module.exports = {
    checkToken,
    router
};

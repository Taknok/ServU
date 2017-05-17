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

module.exports = {
    decodeToken,
    checkTokenMiddleware,
    router
};
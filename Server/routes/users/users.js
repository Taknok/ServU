const express = require('express');
const users = require("../../database/users");
const error = require("../../error");
const deviceRouter = require("./devices");

let router = express.Router();
module.exports = router;

router.get('/users/', function (req, res, next) {
    let firstname = req.query['firstname'];
    let lastname = req.query['lastname'];
    users.getAllUsers(firstname, lastname)
        .then(docs => {
            if (docs.length === 0) {
                next(error.error(404, "No users"));
            } else {
                res.status(200).json(docs);
            }
        })
        .catch(err => {
            next(err)
        })
});

router.post('/users/', function (req, res, next) {
    let _user = req.body;
    try {
        let user = users.validateUser(_user);
        users.getUserByUsername(user.username)
            .then(user => {
                return new Promise((resolve, reject) => {
                    if (user !== undefined) {
                        reject(error.error(409, "Another User has the same username"));
                    } else {
                        resolve();
                    }
                });
            })
            .then(() => users.addUser(user))
            .then(() => {
                res.status(201).end()
            })
            .catch(err => {
                next(err);
            })
    } catch (err) {
        next(new error.error(400, "Wrong format", err.message));
    }
});

router.get('/users/:username', function (req, res, next) {
    let username = req.params.username;
    users.getUserByUsername(username)
        .then(user => {
            if (user === undefined) {
                next(new error.error(404, "User not found"));
            } else {
                res.status(200).json(user);
            }
        })
        .catch(err => {
            next(err);
        })
});

router.put('/users/:username', function (req, res, next) {
    let username = req.params.username;
    let _user2 = req.body;
    try {
        let user2 = users.validateUserUpdate(_user2);
        let promise = new Promise((resolve, reject) => {
            if (user2.username !== undefined) {
                reject();
            } else {
                resolve();
            }
        }).catch(() => users.getUserByUsername(user2.username))
            .then((user) => {
                return new Promise((resolve, reject) => {
                    if (user !== undefined) {
                        reject(new error.error(409, "Another user has the same username"));
                    } else {
                        resolve();
                    }
                });
            })
            .then(() => users.updateUser(username, user2))
            .then(updated => {
                return new Promise((resolve, reject) => {
                    if (!updated) {
                        reject(new error.error(404, "User not found"));
                    } else {
                        res.status(204).end();
                        resolve();
                    }
                });
            })
            .catch(err => {
                next(err);
            });
    } catch (err) {
        next(new error.error(400, "Wrong format", err.message));
    }
});

router.delete('/users/:username', function (req, res, next) {
    let username = req.params.username;
    users.deleteUser(username)
        .then(deleted => {
            if (!deleted) {
                next(new error.error(404, "User not found"));
            } else {
                res.status(204).end();
            }
        })
        .catch(err => {
            next(err);
        })
});

router.use('/users/:username/\*', function (req, res, next) {
    let username = req.params.username;
    req.SERVER['username'] = username;
    users.getUserByUsername(username)
        .then(user => {
            if (user === undefined) {
                next(new error.error(404, "User not found"));
            } else {
                next();
            }
        })
        .catch(err => {
            next(err)
        });
});

router.use('/users/:username/', deviceRouter);
const express = require("express");
const error = require("../error");
const actions = require("../database/actions");
const users = require("../database/users");
const devices = require("../database/devices");

let router = express.Router();
module.exports = router;

router.get('/actions', function (req, res, next) {
    let username = req.query.username;
    let deviceUuid = req.query.device_uuid;
    if (deviceUuid === undefined && username === undefined) {
        next(new error.error(400, "Bad Request", "At least one of the parameters 'username' or 'device_uuid' is required"));
    } else {
        actions.getAllActionsByUuidAndCreator(deviceUuid, username)
            .then(docs => {
                if (docs.length === 0) {
                    next(new error.error(404, "No such action"));
                } else {
                    res.status(200).json(docs);
                }
            })
            .catch(err => {
                next(err)
            })
    }
});

router.post('/actions', function (req, res, next) {
    let _action = req.body;
    try {
        let action = actions.validateAction(_action);
        users.getUserByUsername(action.creator_username)
            .then(user => {
                return new Promise((resolve, reject) => {
                    if (user === undefined) {
                        reject(new error.error(400, "The creator of this action does not exist"));
                    } else {
                        resolve();
                    }
                });
            })
            .then(() => devices.getDeviceByUuid(action.device_uuid))
            .then(device => {
                return new Promise((resolve, reject) => {
                    if (device === undefined) {
                        reject(new error.error(400, "The device which has to execute this action does not exist"));
                    } else {
                        resolve();
                    }
                });
            })
            .then(() => actions.addAction(action))
            .then(created => {
                res.status(201).json(created);
            })
            .catch(err => next(err));
    } catch (err) {
        next(new error.error(400, "Wrong format", err.message));
    }
});

router.get('/actions/:id', function (req, res, next) {
    let id = req.params.id;
    actions.getOneActionById(id)
        .then(result => {
            if (result === undefined) {
                next(new error.error(404, "Action not found"));
            } else {
                res.status(200).json(result);
            }
        })
        .catch(err => {
            next(err)
        })
});

router.delete('/actions/:id', function (req, res, next) {
    let id = req.params.id;
    actions.deleteActionById(id)
        .then(deleted => {
            if (deleted) {
                res.status(204).end();
            } else {
                next(new error.error(404, "Action not found"));
            }
        })
        .catch(err => {
            next(err)
        })
});

router.put('/actions/:id/status', function (req, res, next) {
    let _status = req.body['action_status'];
    console.log("status" + _status);
    let id = req.params.id;
    try {
        let status = actions.validateStatus(_status);
        let action2 = {};
        action2.status = status;
        actions.updateOneActionById(id, action2)
            .then(updated => {
                if (updated) {
                    res.status(204).end();
                } else {
                    next(new error.error(404, "Action not found"));
                }
            })
            .catch(err => {
                next(err)
            })
    } catch (err) {
        next(new error.error(400, "Wrong Format", err.message));
    }
});
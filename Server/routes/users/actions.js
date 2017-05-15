const express = require("express");
const error = require("../../error");
const actions = require("../../database/actions");
const actionsAvailable = require("../../database/actionsAvailable");
const validator = require("../../contentVerification/validator");

let router = express.Router();
module.exports = router;

router.get('/actionsUser', function (req, res, next) {
    let username = req.SERVER.username;
    let deviceUuid = req.SERVER.uuid;
    actions.getAllActionsByUuidAndCreator(deviceUuid, username)
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            next(err)
        })
});

router.post('/actionsUser', function (req, res, next) {
    let creator_username = req.SERVER.username;
    let device_uuid = req.SERVER.uuid;
    let _action = req.body;
    try {
        let action = actions.validateAction(_action);
        validator.validateAction(action.type, device_uuid, action.parameters)
            .then(() => actions.addAction(action, creator_username, device_uuid))
            .then(created => {
                res.status(201).json(created);
            })
            .catch(err => next(err));
    } catch (err) {
        next(new error.error(400, "Wrong format", err.message));
    }
});

router.get('/actionsUser/:id', function (req, res, next) {
    let id = req.params.id;
    let creator_username = req.SERVER.username;
    let device_uuid = req.SERVER.uuid;
    actions.getOneActionById(id, creator_username, device_uuid)
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

router.delete('/actionsUser/:id', function (req, res, next) {
    let id = req.params.id;
    let creator_username = req.SERVER.username;
    let device_uuid = req.SERVER.uuid;
    actions.deleteActionById(id, creator_username, device_uuid)
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
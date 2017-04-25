const express = require('express');
const error = require('../error');
const actionsAvailables = require('../database/actionsAvailable');

let router = express.Router();
module.exports = router;

router.get('/actions_available', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    let enabled = req.query['active'];
    actionsAvailables.getAllActionsByUuid(uuid, enabled)
        .then(docs => {
            if (docs.length === 0) {
                next(new error.error(404, "This device has no actions available"));
            } else {
                res.status(200).json(docs);
            }
        })
        .catch(err => {
            next(err)
        })
});

router.post('/actions_available', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    let owner = req.SERVER.username;
    let _action = req.body;
    try {
        let action = actionsAvailables.validateActionAvailable(_action);
        actionsAvailables.getOneAction(uuid, action.name)
            .then(_Action => {
                return new Promise((resolve, reject) => {
                    if (_Action !== undefined) {
                        reject(new error.error(409, "This action is already available"));
                    } else {
                        resolve();
                    }
                });
            })
            .then(() => actionsAvailables.addAction(uuid, owner, action))
            .then(() => {
                res.status(201).end()
            })
            .catch(err => {
                next(err)
            })
    } catch (err) {
        next(new error.error(400, "Wrong format", err.message));
    }
});

router.put('/actions_available/:name', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    let name = req.params.name;
    let _action2 = req.body;
    try {
        let action2 = actionsAvailables.validateActionAvailableUpdate(_action2);
        actionsAvailables.getOneAction(uuid, name)
            .then(action => {
                return new Promise((resolve, reject) => {
                    if (action === undefined) {
                        reject(new error.error(404, "This action does not exist"));
                    } else {
                        resolve();
                    }
                });
            })
            .then(() => actionsAvailables.updateOneAction(uuid, name, action2))
            .then(updated => {
                if (updated) {
                    res.status(204).end();
                } else {
                    next(new error.error(500, "Error : Action not updated"));
                }
            })
            .catch(err => {
                next(err)
            })

    } catch (err) {
        next(new error.error(400, "Wrong Format", err.message))
    }
});
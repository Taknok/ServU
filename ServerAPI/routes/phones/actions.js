const express = require("express");
const error = require("../../error");
const actions = require("../../database/actions");

let router = express.Router();
module.exports = router;

router.put('/actionsUser/:id', function (req, res, next) {
    let _status = req.body['action_status'];
    let id = req.params.id;
    let creator_username = req.SERVER.username;
    let device_uuid = req.SERVER.uuid;
    try {
        let status = actions.validateStatus(_status);
        let action2 = {};
        action2.status = status;
        actions.updateOneActionById(id, creator_username, device_uuid, action2)
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

router.get('/actionUserToDo', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    actions.getOldestActionPendingByDevice(uuid)
        .then(action => {
            if (action !== undefined) {
                res.status(200).json(action);
            } else {
                res.status(204).end();
            }
        })
        .catch(err => {
            next(err)
        })
});
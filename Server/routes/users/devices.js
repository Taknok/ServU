const express = require('express');
const devices = require("../../database/devices");
const error = require("../../error");
const probesRouter = require("./probes");
const actionsAvailableRouter = require("./actionsAvailable");
const actionsRouter = require("./actions");

let router = express.Router();
module.exports = router;

router.get('/devices', function (req, res, next) {
    let username = req.SERVER.username;
    devices.getAllDevicesByUsername(username)
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            next(err)
        })
});

router.use('/devices/:uuid\*', function (req, res, next) {
    let username = req.SERVER.username;
    let uuid = req.params.uuid;
    req.SERVER.uuid = uuid;
    devices.getDeviceByUuid(uuid, username)
        .then(device => {
            if (device === undefined) {
                next(new error.error(404, "Device not found"));
            }
            else {
                next();
            }
        })
        .catch(err => {
            next(err)
        });
});

router.get('/devices/:uuid', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    devices.getDeviceByUuid(uuid)
        .then(device => {
            res.status(200).json(device);
        })
        .catch(err => {
            next(err)
        });
});

router.delete('/devices/:uuid', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    let owner = req.SERVER.username;
    devices.deleteOneDevice(owner, uuid)
        .then(deleted => {
            if (deleted) {
                res.status(204).end();
            } else {
                next(new error.error(500, "Unknown error : Device not deleted"));
            }
        })
        .catch(err => {
            next(err)
        })
});

function updateHandler(req, res, next) {
    let uuid = req.SERVER.uuid;
    devices.updateOneDevice(uuid, req.SERVER.device2)
        .then(updated => {
            if (updated) {
                res.status(204).end();
            } else {
                next(new error.error(500, "Error : Device not updated"));
            }
        })
        .catch(err => {
            next(err)
        })
}

router.put('/devices/:uuid/name', function (req, res, next) {
    let name = req.body.name;
    if (name === undefined || typeof name !== "string") {
        next(new error.error(400, "Wrong format"));
    } else {
        req.SERVER.device2 = {};
        req.SERVER.device2['name'] = name;
        next();
    }
}, updateHandler);

router.use('/devices/:uuid/', probesRouter);
router.use('/devices/:uuid/', actionsAvailableRouter);
router.use('/devices/:uuid/', actionsRouter);
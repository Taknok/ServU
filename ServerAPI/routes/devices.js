const express = require('express');
const devices = require("../database/devices");
const error = require("../error");
const probesRouter = require("./probes");
const actionsAvailableRouter = require("./actionsAvailable");
const actions = require("../database/actions");

let router = express.Router();
module.exports = router;

router.get('/devices', function (req, res, next) {
    let username = req.SERVER.username;
    devices.getAllDevicesByUsername(username)
        .then(docs => {
            if (docs.length === 0) {
                next(new error.error(404, "This user has no devices"));
            } else {
                res.status(200).json(docs);
            }
        })
        .catch(err => {
            next(err)
        })
});

router.post('/devices', function (req, res, next) {
    let username = req.SERVER.username;
    let _device = req.body;
    try {
        let device = devices.validateDevice(_device);
        devices.getDeviceByUuid(device.uuid)
            .then(deviceReturned => {
                return new Promise((resolve, reject) => {
                    if (deviceReturned !== undefined) {
                        reject(new error.error(409, "Another device has the same uuid"));
                    } else {
                        resolve();
                    }
                })
            })
            .then(() => devices.addDevice(username, device))
            .then(() => {
                res.status(201).end()
            })
            .catch(err => {
                next(err)
            });
    } catch (err) {
        next(new error.error(400, "Wrong format", err.message));
    }
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
    let owner = req.SERVER.username;
    devices.updateOneDevice(owner, uuid, req.SERVER.device2)
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

router.put('/devices/:uuid/version', function (req, res, next) {
    let version = req.body.version;
    if (version === undefined || typeof version !== "string") {
        next(new error.error(400, "Wrong format"));
    } else {
        req.SERVER.device2 = {};
        req.SERVER.device2['version'] = version;
        next();
    }
}, updateHandler);

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

router.get('/devices/:uuid/action_to_do', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    actions.getOldestActionPendingByDevice(uuid)
        .then(action => {
            if (action !== undefined) {
                res.status(200).json(action);
            } else {
                next(new error.error("404", "No actions pending on this device"));
            }
        })
        .catch(err => {
            next(err)
        })
});

router.use('/devices/:uuid/', probesRouter);
router.use('/devices/:uuid/', actionsAvailableRouter);
const express = require('express');
const devices = require("../../database/devices");
const error = require("../../error");
const users = require("../../database/users");
const checkToken = require("../authentication").checkToken;

const probesRouter = require("./probes");
const actionsAvailableRouter = require("./actionsAvailable");
const actionsRouter = require("./actions");

let router = express.Router();
module.exports = router;

router.post('/phones', checkToken ,function (req, res, next) {
    // ==> Il faut vérifier que le owner du device est bien l'utilisateur authentifié
    let decodedUsername = req.decodedUsername;
    let _device = req.body;
    try {
        let device = devices.validateDevice(_device);
        if(decodedUsername !== device.owner){
            next(new error.error(403,"Forbidden","You are not allowed to access to this user data"))
        }else{
            users.getUserByUsername(device.owner)
                .then(user => {
                    return new Promise((resolve, reject) => {
                        if (user === undefined) {
                            reject(new error.error(400, "Owner not found"));
                        } else {
                            resolve();
                        }
                    })
                })
                .then(() => devices.getDeviceByUuid(device.uuid))
                .then(deviceReturned => {
                    return new Promise((resolve, reject) => {
                        if (deviceReturned !== undefined) {
                            reject(new error.error(409, "Another device has the same uuid"));
                        } else {
                            resolve();
                        }
                    })
                })
                .then(() => devices.addDevice(device))
                .then(() => {
                    res.status(201).end()
                })
                .catch(err => {
                    next(err)
                });
        }
    } catch (err) {
        next(new error.error(400, "Wrong format", err.message));
    }
});

router.use('/phones/:uuid\*',checkToken, function (req, res, next) {
    // ==> Il faut vérifier que le device appartient bien à l'utilisateur authentifié
    let decodedUsername = req.decodedUsername;
    let uuid = req.params.uuid;
    req.SERVER.uuid = uuid;
    req.SERVER.username = decodedUsername;
    devices.getDeviceByUuid(uuid,decodedUsername) //==> Ajouter username en 2ème param
        .then(owner => {
            if (owner === undefined) {
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

router.put('/phones/:uuid/version', function (req, res, next) {
    let version = req.body.version;
    if (version === undefined || typeof version !== "string") {
        next(new error.error(400, "Wrong format"));
    } else {
        req.SERVER.device2 = {};
        req.SERVER.device2['version'] = version;
        next();
    }
}, updateHandler);

router.use('/phones/:uuid/', probesRouter);
router.use('/phones/:uuid/', actionsAvailableRouter);
router.use('/phones/:uuid/', actionsRouter);
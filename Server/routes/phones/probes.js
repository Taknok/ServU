const express = require('express');
const error = require('../../error');
const probes = require('../../database/probes');
const eventsManager = require("../../eventsManager");

let router = express.Router();
module.exports = router;

router.post('/probes', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    let owner = req.SERVER.username;
    let _probe = req.body;
    try {
        let probe = probes.validateProbe(_probe);
        probes.getOneProbe(uuid, probe.name)
            .then(_Probe => {
                return new Promise((resolve, reject) => {
                    if (_Probe !== undefined) {
                        reject(new error.error(409, "This probe already exists"));
                    } else {
                        resolve();
                    }
                });
            })
            .then(() => probes.addProbe(uuid, owner, probe))
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

router.put('/probes/:name', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    let name = req.params.name;
    let _probe2 = req.body;
    try {
        let probe2 = probes.validateProbeUpdate(_probe2);
        probes.getOneProbe(uuid, name)
            .then(probe => {
                return new Promise((resolve, reject) => {
                    if (probe === undefined) {
                        next(new error.error(404, "Probe not found"));
                    } else {
                        resolve();
                    }
                });
            })
            .then(() => probes.updateOneProbe(uuid, name, probe2))
            .then(updated => {
                if (updated) {
                    res.status(204).end();
                    eventsManager.onProbeUpdate(name,uuid);
                } else {
                    next(new error.error(500, "Error : Probe not updated"));
                }
            })
            .catch(err => {
                next(err)
            })
    } catch (err) {
        next(new error.error(400, "Wrong format", err.message));
    }
});
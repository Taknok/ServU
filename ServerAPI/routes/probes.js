const express = require('express');
const error = require('../error');
const probes = require('../database/probes');

let router = express.Router();
module.exports = router;

router.get('/probes', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    probes.getAllProbesByUuid(uuid)
        .then(docs => {
            if (docs.length === 0) {
                next(new error.error(404, "This device has no probes"));
            } else {
                res.status(200).json(docs);
            }
        })
        .catch(err => {
            next(err)
        })
});

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

router.get('/probes/:name', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    let name = req.params.name;
    probes.getOneProbe(uuid, name)
        .then(probe => {
            return new Promise((resolve, reject) => {
                if (probe !== undefined) {
                    resolve(probe);
                } else {
                    reject(new error.error(404, "Probe not found"));
                }
            })
        })
        .then(probe => {
            res.status(200).json(probe)
        })
        .catch(err => {
            next(err)
        })
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
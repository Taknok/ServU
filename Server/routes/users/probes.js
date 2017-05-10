const express = require('express');
const error = require('../../error');
const probes = require('../../database/probes');

let router = express.Router();
module.exports = router;

router.get('/probes', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    probes.getAllProbesByUuid(uuid)
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            next(err)
        })
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
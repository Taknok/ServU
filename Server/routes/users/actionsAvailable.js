const express = require('express');
const error = require('../../error');
const actionsAvailables = require('../../database/actionsAvailable');

let router = express.Router();
module.exports = router;

router.get('/actionsAvailable', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    let enabled = req.query['active'];
    actionsAvailables.getAllActionsByUuid(uuid, enabled)
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            next(err)
        })
});
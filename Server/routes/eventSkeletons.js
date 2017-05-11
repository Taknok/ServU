const error = require('../error');
const express = require('express');
const eventSkeletons = require('../database/eventSkeletons');
const checkToken = require("./authentication").checkToken;

let router = express.Router();
module.exports = router;

router.get('/eventSkeletons', checkToken, function (req, res, next) {
    eventSkeletons.getAllEventSkeletons()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            next(err)
        })
});

router.get('/eventSkeletons/:id', checkToken, function (req, res, next) {
    let id = req.params.id;
    eventSkeletons.getEventSkeletonById(id)
        .then(docs => {
            if (docs.length === 0) {
                next(error.error(404, "eventSkeleton not found"));
            } else {
                res.status(200).json(docs);
            }
        })
        .catch(err => {
            next(err)
        })
});
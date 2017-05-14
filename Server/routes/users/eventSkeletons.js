const error = require('../../error');
const express = require('express');
const eventSkeletons = require('../../database/eventSkeletons');
const checkToken = require("../authentication").checkToken;

let router = express.Router();
module.exports = router;

router.get('/eventSkeletons', checkToken, function (req, res, next) {
    let username = req.SERVER.username;
    eventSkeletons.getAllEventSkeletons(username)
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            next(err)
        })
});

router.post('/eventSkeletons', function (req, res, next) {
    let username = req.SERVER.username;
    let event = req.body;
    event.creator=username;
    try {
      eventSkeletons.addEventSkeleton(event)
            .then(created => {
                res.status(201).json(created);
            })
            .catch(err => next(err));
    } catch (err) {
        next(new error.error(400, "Wrong format", err.message));
    }
});

router.get('/eventSkeletons/:id', checkToken, function (req, res, next) {
    let id = req.params.id;
    eventSkeletons.getEventSkeletonById(id)
        .then(event => {
            if (event === undefined) {
                next(error.error(404, "eventSkeleton not found"));
            } else {
                res.status(200).json(event);
            }
        })
        .catch(err => {
            next(err)
        })
});

router.delete('/eventSkeletons/:id', function (req, res, next) {
    let id = req.params.id;
    eventSkeletons.deleteEventSkeletonByid(id)
        .then(deleted => {
            if (deleted) {
                res.status(204).end();
            } else {
                next(new error.error(404, "Event not found"));
            }
        })
        .catch(err => {
            next(err)
        })
});
const express = require('express');
const error = require('../../error');
const events = require('../../database/events');

let router = express.Router();
module.exports = router;

router.get('/events', function (req, res, next) {
    let uuid = req.SERVER.uuid;
    events.getEventsByDeviceUuid(uuid)
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            next(err)
        })
});

router.post('/events', function (req, res, next) {
    let username = req.SERVER.username;
    let deviceUuid = req.SERVER.uuid;
    let skeletonId = req.body.idEventSkeleton;
    try {
      events.addEventBySkeletonId(skeletonId, deviceUuid, username)
            .then(created => {
                res.status(201).json(created);
            })
            .catch(err => next(err));
    } catch (err) {
        next(new error.error(400, "Wrong format", err.message));
    }
});

router.delete('/events/:id', function (req, res, next) {
    let id = req.params.id;
    let username = req.SERVER.username;
    let deviceUuid = req.SERVER.uuid;
    events.deleteEventById(id, username, deviceUuid)
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
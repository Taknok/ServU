const error = require('../error');
const express = require('express');
const eventSkeletons = require('../database/eventSkeletons');


let router = express.Router();
module.exports = router;


router.get('/eventSkeletons', function (req, res, next) {
    eventSkeletons.getAllEventSkeletons()
        .then(docs => {
            if (docs.length === 0) {
                next(error.error(404, "No eventSkeleton"));
            } else {
                res.status(200).json(docs);
            }
        })
        .catch(err => {
            next(err)
        })
});

router.get('/eventSkeletons/:id', function (req, res, next) {
  let id = req.params.id;
  eventSkeletons.getEventSkeletonById(id)
    .then(docs => {
        if (docs.length === 0) {
            next(error.error(404, "No eventSkeleton"));
        } else {
            res.status(200).json(docs);
        }
    })
    .catch(err => {
      next(err)
    })
});

module.exports = {
    router
};

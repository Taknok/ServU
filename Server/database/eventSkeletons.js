const db = require("./database");
const cm = require("./common");
const mongoCommon = require("./mongoCommon");

const eventSkeletonProperties = [
    new cm.Property("label", "string", undefined),
    new cm.Property("description", "string", undefined),
    new cm.Property("code", "object", undefined)
];

let eventSkeletonCollection = mongoCommon.createCollection(
    "EventSkeletons",
    {},
    "id"
);

exports.getAllEventSkeletons = function (username) {
    let query = {};
    query.creator = username;
    return eventSkeletonCollection.getElementsByQuery(query);
};

exports.getEventSkeletonById = function (id) {
    let query = {};
    return cm.getIdObject(id)
        .then(id => {
            query._id = id;
            return query;
        })
        .then(query => eventSkeletonCollection.getOneElementByQuery(query))
};

exports.addEventSkeleton = function (eventSkeleton) {
    return eventSkeletonCollection.addOneElement(eventSkeleton);
};


exports.deleteEventSkeletonByid = function (id) {
    let filter = {};
    return cm.getIdObject(id)
        .then(id => {
            filter._id = id;
        })
        .then(() => eventSkeletonCollection.deleteOneElement(filter));
};

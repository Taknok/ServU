const db = require("./database");
const cm = require("./common");
const mongoCommon = require("./mongoCommon");

const eventSkeletonProperties = [
    new cm.Property("label", "string", undefined),
    new cm.Property("description", "string", undefined),
    new cm.Property("if", "object", undefined),
    new cm.Property("action", "object", undefined)
];

let eventSkeletonCollection = mongoCommon.createCollection(
    "EventSkeletons",
    {"creator": 0},
    "id"
);

exports.validateEventSkeleton = function (object) {
    return cm.propertiesVerificationForCreation(object, eventSkeletonProperties);
};

exports.getEventSkeletonsByUser = function (username) {
    let query = {};
    query.creator = username;
    return eventSkeletonCollection.getElementsByQuery(query)
        .then(events => {
            events.forEach(elt => cm.changeIdName(elt));
            return events;
        })
};

exports.getEventSkeletonByIdAndUsername = function (id, username) {
    let query = {};
    query.creator = username;
    return cm.getIdObject(id)
        .then(id => {
            query._id = id;
            return query;
        })
        .then(query => eventSkeletonCollection.getOneElementByQuery(query))
        .then(event => cm.changeIdName(event))
};

exports.addEventSkeleton = function (eventSkeleton, creator) {
    eventSkeleton.creator = creator;
    return eventSkeletonCollection.addOneElement(eventSkeleton).then(event => cm.changeIdName(event));
};

exports.deleteEventSkeletonById = function (id, username) {
    let filter = {};
    filter.creator = username;
    return cm.getIdObject(id)
        .then(id => {
            filter._id = id;
        })
        .then(() => eventSkeletonCollection.deleteOneElement(filter));
};

exports.deleteEventSkeletonsByOwner = function (owner) {
    let filter = {};
    filter.creator = owner;
    return eventSkeletonCollection.deleteManyElements(filter);
};

exports.updateOwnerOfManyEventSkeletons = function (owner, owner2) {
    let filter = {};
    filter.creator = owner;
    let update = {};
    update["$set"] = {};
    update["$set"].creator = owner2;
    return db.mongo(eventSkeletonCollection.name).then(collection => collection.updateMany(filter, update));
};
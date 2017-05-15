const db = require("./database");
const cm = require("./common");
const mongoCommon = require("./mongoCommon");
const error = require("../error");

const eventSkeletonProperties = [
    new cm.Property("label", "string", undefined),
    new cm.Property("description", "string", undefined),
    new cm.Property("if", "object", undefined),
    new cm.Property("action", "object", undefined)
];

let eventsCollection = mongoCommon.createCollection(
    "Events",
    {"device": 0, "owner": 0, "probesRequired": 0, "status": 0},
    "id"
);

exports.validateEvent = function (object) {
    return cm.propertiesVerificationForCreation(object, eventSkeletonProperties);
};

exports.addEvent = function (deviceUuid, username, event, probesRequired) {
    event.owner = username;
    event.device = deviceUuid;
    event.probesRequired = probesRequired;
    event.status = false;
    return eventsCollection.addOneElement(event)
        .then(event => cm.changeIdName(event))
};

exports.getEventsByDeviceUuid = function (uuid) {
    let query = {};
    query.device = uuid;
    return eventsCollection.getElementsByQuery(query)
        .then(events => {
            events.forEach(elt => cm.changeIdName(elt));
            return events;
        });
};

exports.getEventsByUuidAndProbeRequired = function (uuid, probeRequired) {
    let query = {};
    query.device = uuid;
    query.probesRequired = probeRequired;
    return db.mongo(eventsCollection.name)
        .then(collection => collection.find(query).toArray())
        .then(events => {
            events.forEach(elt => cm.changeIdName(elt));
            return events;
        });
};

exports.updateEventStatusByObjectId = function (id, status) {
    let event = {};
    event.status = status;
    let filter = {};
    filter._id = id;
    return eventsCollection.updateOneElement(filter, event)
};

exports.deleteEventById = function (id, username, uuid) {
    let filter = {};
    filter.owner = username;
    filter.device = uuid;
    return cm.getIdObject(id)
        .then(id => {
            filter._id = id;
        })
        .then(() => eventsCollection.deleteOneElement(filter))
};

exports.deleteEventsByOwner = function (owner) {
    let filter = {};
    filter.owner = owner;
    return eventsCollection.deleteManyElements(filter);
};

exports.deleteEventsAttachedToDevice = function (deviceUuid) {
    let filter = {};
    filter.device = deviceUuid;
    return eventsCollection.deleteManyElements(filter);
};

exports.updateOwnerOfManyEvents = function (owner, owner2) {
    let filter = {};
    filter.owner = owner;
    let update = {};
    update["$set"] = {};
    update["$set"].owner = owner2;
    return db.mongo(eventsCollection.name).then(collection => collection.updateMany(filter, update));
};
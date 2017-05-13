const db = require("./database");
const cm = require("./common");
const mongoCommon = require("./mongoCommon");
const error = require("../error");
const eventSkeleton = require("./eventSkeletons");

const eventSkeletonProperties = [
    new cm.Property("idEventSkeleton", "string", undefined),
];

let eventsCollection = mongoCommon.createCollection(
    "Events",
    {},
    "id"
);

exports.validateEvent = function (object) {
    return cm.propertiesVerificationForCreation(object, eventSkeletonProperties);
};

exports.addEventBySkeletonId = function (skeletonId, deviceUuid, username) {
    return eventSkeleton.getEventSkeletonById(skeletonId)
        .then(skeleton => {
            return new Promise((resolve, reject) => {
                if (skeleton === undefined) {
                    reject(new error.error(404, "Not found", "Skeleton does not exist"));
                } else {
                    resolve(skeleton);
                }
            })
        })
        .then(skeleton => {
            let event = {
                owner: username,
                device: deviceUuid,
                label: skeleton.label,
                description: skeleton.description,
                if: skeleton.if,
                action: skeleton.action
                }
            return eventsCollection.addOneElement(event)
        })
        .then(event => cm.changeIdName(event))
};

exports.getEventsByDeviceUuid = function (uuid) {
    let query = {};
    query.device = uuid;
    return eventsCollection.getElementsByQuery(query);
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

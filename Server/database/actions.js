const db = require("./database");
const cm = require("./common");
const mongoCommon = require("./mongoCommon");


const actionsProperties = [
    new cm.Property("type", "string", undefined),
    new cm.Property("label", "string", undefined),
    new cm.Property("description", "string", undefined),
    new cm.Property("parameters", "object", undefined)
];

let actionsCollection = mongoCommon.createCollection(
    "Actions",
    {"creator_username": 0, "device_uuid": 0},
    "id"
);

const STATUS = ["pending", "in progress", "done"];

exports.validateAction = function (object) {
    return cm.propertiesVerificationForCreation(object, actionsProperties);
};

exports.validateStatus = function (status) {
    let validation = false;
    STATUS.forEach(elt => {
        if (elt === status) {
            validation = true;
        }
    });
    if (validation === false) {
        throw new Error(status + " is not a valid status");
    }
    return status;
};

exports.getAllActionsByUuidAndCreator = function (uuid, creatorUsername) {
    let query = {};
    if (uuid !== undefined) query.device_uuid = uuid;
    if (creatorUsername !== undefined) query.creator_username = creatorUsername;
    return actionsCollection.getElementsByQuery(query)
        .then(actions => {
            actions.forEach(action => {
                cm.changeIdName(action)
            });
            return actions;
        })

};

exports.getOneActionById = function (id, creator, deviceUuid) {
    let query = {};
    query.creator_username = creator;
    query.device_uuid = deviceUuid;
    return cm.getIdObject(id)
        .then(id => {
            query._id = id;
            return query;
        })
        .then(query => actionsCollection.getOneElementByQuery(query))
        .then(action => cm.changeIdName(action))
};

exports.getOldestActionPendingByDevice = function (uuid) {
    let query = {};
    query.device_uuid = uuid;
    query.status = STATUS[0];
    let sortObj = {};
    sortObj.creation_date = 1;
    return new Promise((resolve, reject) => {
        db.mongo(actionsCollection.name)
            .then(collection => collection.find(query).sort(sortObj).project(actionsCollection.projection).toArray())
            .then(docs => {
                resolve(cm.changeIdName(docs[0]));
            })
            .catch(err => {
                reject(err);
            })
    });
};

exports.addAction = function (action, creator, deviceUuid) {
    action.creation_date = Date.now();
    action.status = STATUS[0];
    action.creator_username = creator;
    action.device_uuid = deviceUuid;
    return actionsCollection.addOneElement(action).then(action => cm.changeIdName(action));
};

exports.updateOneActionById = function (id, creator, deviceUuid, action2) {
    let filter = {};
    filter.creator_username = creator;
    filter.device_uuid = deviceUuid;
    return cm.getIdObject(id)
        .then(id => {
            filter._id = id;
            return filter;
        })
        .then(filter => actionsCollection.updateOneElement(filter, action2))
};

exports.updateCreatorOfManyActions = function (creator, creator2) {
    let filter = {};
    filter.creator_username = creator;
    let update = {};
    update["$set"] = {};
    update["$set"].creator_username = creator2;
    return db.mongo(actionsCollection.name).then(collection => collection.updateMany(filter, update));
};

exports.deleteActionById = function (id, creator, deviceUuid) {
    let filter = {};
    filter.creator_username = creator;
    filter.device_uuid = deviceUuid;
    return cm.getIdObject(id)
        .then(id => {
            filter._id = id;
            return filter;
        })
        .then(filter => actionsCollection.deleteOneElement(filter));
};

exports.deleteActionsOfCreator = function (creator) {
    let filter = {};
    filter.creator_username = creator;
    return actionsCollection.deleteManyElements(filter);
};

exports.deleteActionsAttachedToDevice = function (uuid) {
    let filter = {};
    filter.device_uuid = uuid;
    return actionsCollection.deleteManyElements(filter);
};
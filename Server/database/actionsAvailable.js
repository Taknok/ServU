const db = require("./database");
const cm = require("./common");
const mongoCommon = require("./mongoCommon");

const actionsAvailableProperties = [
    new cm.Property("name", "string", false),
    new cm.Property("label", "string", true),
    new cm.Property("enabled", "boolean", true),
    new cm.Property("description", "string", true)
];

let actionsAvailableCollection = mongoCommon.createCollection(
    "ActionsAvailable",
    {"_id": 0, "uuid": 0, "owner": 0},
    "name"
);

exports.validateActionAvailable = function (object) {
    return cm.propertiesVerificationForCreation(object, actionsAvailableProperties);
};

exports.validateActionAvailableUpdate = function (object) {
    return cm.propertiesVerificationForUpdate(object, actionsAvailableProperties);
};


exports.getAllActionsByUuid = function (uuid, enabled) {
    let query = {};
    query.uuid = uuid;
    if (enabled !== undefined && enabled.toLowerCase() === "true") query.enabled = true;
    if (enabled !== undefined && enabled.toLowerCase() === "false") query.enabled = false;
    return actionsAvailableCollection.getElementsByQuery(query);
};

exports.getOneAction = function (uuid, name) {
    let query = {};
    query.uuid = uuid;
    query.name = name;
    return actionsAvailableCollection.getOneElementByQuery(query);
};

exports.addAction = function (uuid, owner, action) {
    action.uuid = uuid;
    action.owner = owner;
    return actionsAvailableCollection.addOneElement(action);
};

exports.updateOneAction = function (uuid, name, action2) {
    let filter = {};
    filter.uuid = uuid;
    filter.name = name;
    return actionsAvailableCollection.updateOneElement(filter, action2);
};

exports.deleteActionsByUuid = function (uuid) {
    let filter = {};
    filter.uuid = uuid;
    return actionsAvailableCollection.deleteManyElements(filter);
};

exports.deleteActionsByOwner = function (owner) {
    let filter = {};
    filter.owner = owner;
    return actionsAvailableCollection.deleteManyElements(filter);
};

exports.updateOwnerOfActions = function (previousOwner, currentOwner) {
    let filter = {};
    filter['owner'] = previousOwner;
    let update = {};
    update['$set'] = {};
    update['$set']['owner'] = currentOwner;
    return db.mongo(actionsAvailableCollection.name).then(collection => collection.updateMany(filter, update));
};
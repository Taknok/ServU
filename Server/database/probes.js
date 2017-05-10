const db = require("./database");
const cm = require("./common");
const mongoCommon = require("./mongoCommon");

const probesProperties = [
    new cm.Property("name", "string", false),
    new cm.Property("label", "string", true),
    new cm.Property("active", "boolean", true),
    new cm.Property("data", "object", true)
];

let probesCollection = mongoCommon.createCollection(
    "Probes",
    {"_id": 0, "uuid": 0, "owner": 0},
    "name"
);

exports.validateProbe = function (object) {
    return cm.propertiesVerificationForCreation(object, probesProperties);
};

exports.validateProbeUpdate = function (object) {
    return cm.propertiesVerificationForUpdate(object, probesProperties);
};

exports.getAllProbesByUuid = function (uuid) {
    let query = {};
    query.uuid = uuid;
    return probesCollection.getElementsByQuery(query);
};

exports.getOneProbe = function (uuid, name) {
    let query = {};
    query.uuid = uuid;
    query.name = name;
    return probesCollection.getOneElementByQuery(query);
};

exports.addProbe = function (uuid, owner, probe) {
    probe.uuid = uuid;
    probe.owner = owner;
    probe.lastUpdate = Date.now();
    return probesCollection.addOneElement(probe);
};

exports.updateOneProbe = function (uuid, name, probe2) {
    let filter = {};
    filter.uuid = uuid;
    filter.name = name;
    if (probe2.data !== undefined) {
        probe2.lastUpdate = Date.now();
    }
    return probesCollection.updateOneElement(filter, probe2);
};

exports.deleteProbesByUuid = function (uuid) {
    let filter = {};
    filter.uuid = uuid;
    return probesCollection.deleteManyElements(filter);
};

exports.deleteProbesByOwner = function (owner) {
    let filter = {};
    filter.owner = owner;
    return probesCollection.deleteManyElements(filter);
};

exports.updateOwnerOfProbes = function (previousOwner, currentOwner) {
    let filter = {};
    filter['owner'] = previousOwner;
    let update = {};
    update['$set'] = {};
    update['$set']['owner'] = currentOwner;
    return db.mongo(probesCollection.name).then(collection => collection.updateMany(filter, update));
};
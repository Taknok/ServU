const db = require("./database");
const error = require("../error");
const cm = require("./common");
const mongoCommon = require("./mongoCommon");
const probes = require("./probes");
const actionsAvailable = require("./actionsAvailable");
const actions = require("./actions");

const devicesProperties = [
    new cm.Property("name", "string", undefined),
    new cm.Property("manufacturer", "string", undefined),
    new cm.Property("model", "string", undefined),
    new cm.Property("platform", "string", undefined),
    new cm.Property("version", "string", undefined),
    new cm.Property("serial", "string", undefined),
    new cm.Property("uuid", "string", false),
    new cm.Property("owner", "string", false)
];

let devicesCollection = new mongoCommon.createCollection(
    "Devices",
    {"_id": 0, "owner": 0},
    "uuid"
);

exports.validateDevice = function (object) {
    return cm.propertiesVerificationForCreation(object, devicesProperties);
};

exports.getAllDevicesByUsername = function (username) {
    let query = {};
    query.owner = username;
    return devicesCollection.getElementsByQuery(query);
};

exports.getDeviceByUuid = function (uuid, owner) {
    let query = {};
    query.uuid = uuid;
    if (owner !== undefined) query.owner = owner;
    return devicesCollection.getOneElementByQuery(query);
};

exports.getOwnerOfDeviceByUuid = function (uuid) {
    let query = {};
    query.uuid = uuid;
    return db.mongo(devicesCollection.name)
        .then(collection => collection.find(query).toArray())
        .then(docs => {
            return new Promise((resolve, reject) => {
                if (docs.length > 1) {
                    reject(new error.error(500, "DB Error : Two devices have the same uuid"));
                } else {
                    if (docs[0] !== undefined) {
                        resolve(docs[0].owner);
                    } else {
                        resolve(undefined);
                    }

                }
            })
        })
};

exports.addDevice = function (device) {
    return devicesCollection.addOneElement(device);
};

exports.deleteOneDevice = function (owner, uuid) {
    let filter = {};
    filter['owner'] = owner;
    filter['uuid'] = uuid;
    return new Promise((resolve, reject) => {
        db.mongo(devicesCollection.name)
            .then(collection => collection.deleteOne(filter))
            .then(res => {
                if (res.deletedCount === 1) {
                    return Promise.all([
                        probes.deleteProbesByUuid(uuid),
                        actionsAvailable.deleteActionsByUuid(uuid),
                        actions.deleteActionsAttachedToDevice(uuid)
                    ]);
                } else {
                    resolve(false);
                }
            })
            .then(() => {
                resolve(true)
            })
            .catch(err => {
                reject(err)
            })
    });
};

exports.deleteDevicesByOwner = function (owner) {
    let filter = {};
    filter['owner'] = owner;
    return devicesCollection.deleteManyElements(filter);
};

exports.updateOneDevice = function (uuid, device2) {
    let filter = {};
    filter['uuid'] = uuid;
    return devicesCollection.updateOneElement(filter, device2);
};

exports.updateOwnerOfDevices = function (previousOwner, currentOwner) {
    let filter = {};
    filter['owner'] = previousOwner;
    let update = {};
    update['$set'] = {};
    update['$set']['owner'] = currentOwner;
    return db.mongo(devicesCollection.name).then(collection => collection.updateMany(filter, update));
};
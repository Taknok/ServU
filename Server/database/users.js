const db = require("./database");
const cm = require("./common");
const devices = require("./devices");
const probes = require("./probes");
const actionsAvailables = require("./actionsAvailable");
const actions = require("./actions");
const mongoCommon = require("./mongoCommon");
const encryption = require("./encryption");

const userProperties = [
    new cm.Property("username", "string", true),
    new cm.Property("firstname", "string", true),
    new cm.Property("lastname", "string", true),
    new cm.Property("email", "string", true),
    new cm.Property("password", "string", true)
];

let usersCollection = new mongoCommon.createCollection(
    "Users",
    {"_id": 0, "salt": 0, "password": 0},
    "username",
    "users"
);

exports.validateUser = function (object) {
    return cm.propertiesVerificationForCreation(object, userProperties);
};

exports.validateUserUpdate = function (object) {
    return cm.propertiesVerificationForUpdate(object, userProperties);
};

exports.getAllUsers = function (firstname, lastname) {
    let query = {};
    if (cm.isDefined(firstname)) query.firstname = firstname;
    if (cm.isDefined(lastname)) query.lastname = lastname;
    return usersCollection.getElementsByQuery(query);
};

exports.getUserByUsername = function (username) {
    let query = {};
    query.username = username;
    return usersCollection.getOneElementByQuery(query);
};

exports.addUser = function (user) {
    user.salt = encryption.genRandomString();
    user.password = encryption.sha512(user.password, user.salt);
    return usersCollection.addOneElement(user);
};

exports.updateUser = function (username, user2) {
    let filter = {};
    let update = {};
    filter['username'] = username;
    update['$set'] = user2;
    let updated = false;
    return new Promise((resolve, reject) => {
        db.mongo(usersCollection.name)
            .then(collection => collection.updateOne(filter, update))
            .then(res => {
                if (res.matchedCount === 1) updated = true;
                if (res.modifiedCount === 1 && user2.username !== undefined) {
                    return Promise.all([
                        devices.updateOwnerOfDevices(username, user2.username),
                        probes.updateOwnerOfProbes(username, user2.username),
                        actionsAvailables.updateOwnerOfActions(username, user2.username),
                        actions.updateCreatorOfManyActions(username, user2.username)
                    ]);
                }
            })
            .then(() => {
                resolve(updated)
            })
            .catch(err => {
                reject(err)
            })
    })
};

exports.deleteUser = function (username) {
    let filter = {};
    filter['username'] = username;
    return new Promise((resolve, reject) => {
        db.mongo(usersCollection.name)
            .then(collection => collection.deleteOne(filter))
            .then(res => {
                if (res.deletedCount === 1) {
                    return Promise.all([
                        devices.deleteDevicesByOwner(username),
                        probes.deleteProbesByOwner(username),
                        actionsAvailables.deleteActionsByOwner(username),
                        actions.deleteActionsOfCreator(username)
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
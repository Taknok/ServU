const ObjectId = require('mongodb').ObjectID;

function isDefined(variable) {
    return variable !== undefined && variable !== null;
}

function Property(name, type, allowUpdate) {
    this.name = name;
    this.type = type;
    this.allowUpdate = allowUpdate;
}

function propertiesVerificationForCreation(object, properties) {
    let verifiedObject = {};
    properties.forEach(elt => {
        if (!isDefined(object[elt.name])) {
            throw Error(`Missing property : ${elt.name}`);
        } else {
            if (elt.type !== undefined && typeof object[elt.name] !== elt.type) {
                throw Error(`Property ${elt.name} should be ${elt.type} instead of ${typeof object[elt.name]}`);
            }
            verifiedObject[elt.name] = object[elt.name];
        }
    });
    return verifiedObject;
}

function propertiesVerificationForUpdate(object, properties) {
    let result = false;
    let verifiedObject = {};
    let updateProperties = properties.filter(elt => elt.allowUpdate);
    updateProperties.forEach(elt => {
        if (isDefined(object[elt.name])) {
            if (elt.type !== undefined && typeof object[elt.name] !== elt.type) {
                throw Error(`Property ${elt.name} should be ${elt.type} instead of ${typeof object[elt.name]}`);
            }
            result = true;
            verifiedObject[elt.name] = object[elt.name];
        }
    });
    if (result) {
        return verifiedObject;
    } else {
        throw Error("No properties found to update");
    }
}

function changeIdName(object) {
    if (object !== undefined) {
        object.id = object._id;
        delete object._id;
    }
    return object;
}

function getIdObject(id) {
    return new Promise((resolve, reject) => {
        if (typeof id === 'string' && id.length === 24) {
            resolve(new ObjectId(id));
        } else {
            reject(new Error("id must be a string of 24 characters"));
        }
    });
}

module.exports = {
    isDefined,
    Property,
    propertiesVerificationForCreation,
    propertiesVerificationForUpdate,
    changeIdName,
    getIdObject
};
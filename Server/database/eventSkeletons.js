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

exports.getAllEventSkeletons = function () {
    let query = {};
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
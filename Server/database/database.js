const MongoClient = require('mongodb').MongoClient;

const mongoUrl = "mongodb://localhost:27017/ServU";
let mongo = undefined;

exports.connectMongo = function () {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoUrl)
            .then(db => {
                mongo = db;
                resolve();
            })
            .catch((err) => {
                reject(err);
            })
    });
};

exports.mongo = function (collectionName) {
    return new Promise((resolve, reject) => {
        if (mongo) {
            mongo.collection(collectionName, (err, collection) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(collection);
                }
            });
        } else {
            reject("MongoDB not connected");
        }
    })
};
const db = require("./database");
class commonCollection {
    constructor(name, projection, uniqueProperty) {
        this.name = name;
        this.projection = projection;
        this.uniqueProperty = uniqueProperty;
    }

    getElementsByQuery(query) {
        return new Promise((resolve, reject) => {
            db.mongo(this.name)
                .then(collection => collection.find(query).project(this.projection).toArray())
                .then(docs => {
                    resolve(docs)
                })
                .catch(err => {
                    reject(err)
                })
        });
    }

    getOneElementByQuery(query) {
        return new Promise((resolve, reject) => {
            this.getElementsByQuery(query)
                .then(docs => {
                    if (docs.length > 1) {
                        reject(new Error(`DB error : Two ${this.name.toLowerCase()} have the same ${this.uniqueProperty}`));
                    } else {
                        resolve(docs[0]);
                    }
                })
                .catch(err => {
                    reject(err)
                })
        });
    }

    addOneElement(element) {
        return db.mongo(this.name)
            .then(collection => collection.insertOne(element))
            .then(res => res.ops[0]);
    }

    updateOneElement(filter, element2) {
        let update = {};
        update['$set'] = element2;
        return new Promise((resolve, reject) => {
            db.mongo(this.name)
                .then(collection => collection.updateOne(filter, update))
                .then(res => {
                    resolve(res.matchedCount === 1)
                })
                .catch(err => {
                    reject(err)
                })
        })
    };

    deleteOneElement(filter) {
        return new Promise((resolve, reject) => {
            db.mongo(this.name)
                .then(collection => collection.deleteOne(filter))
                .then(res => {
                    resolve(res.deletedCount === 1)
                })
                .catch(err => {
                    reject(err)
                })
        });
    }

    deleteManyElements(filter) {
        return db.mongo(this.name).then(collection => collection.deleteMany(filter))
    }
}

exports.createCollection = function (name, projection, uniqueProperty) {
    return new commonCollection(name, projection, uniqueProperty);
};
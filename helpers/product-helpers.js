const db = require('../config/connection');
const constants = require('../config/constants');

module.exports = {
    addProduct: (product, callback) => {
        db.get().collection(constants.COLLECTION_NAME).insertOne(product)
        .then((data) => {
            console.log("Result after inserting: ", data.insertedId.toString());
            callback(data.insertedId.toString());
        }).catch((err) => {
            console.log("Database error: ", err);
            callback();
        });
    },
};
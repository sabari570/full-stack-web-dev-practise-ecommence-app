const { response } = require('../app');
const db = require('../config/connection');
const constants = require('../config/constants');
const { ObjectId } = require('mongodb');

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

    // Using promise in this function
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(constants.COLLECTION_NAME).find().toArray();
            resolve(products);
        });
    },

    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            const prodObjectId = new ObjectId(prodId);
            db.get().collection(constants.COLLECTION_NAME).deleteOne({_id: prodObjectId})
            .then((response) => {
                resolve(response);
            })
            .catch((err) => reject(err));
        });
    },
};
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

    getProductDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            const prodObjectId = new ObjectId(prodId);
            db.get().collection(constants.COLLECTION_NAME).findOne({_id: prodObjectId})
            .then((product) => {
                resolve(product);
            })
            .catch((err) => reject(err));
        });
    },

    updateProduct: (productDetails) => {
        return new Promise((resolve , reject) => {
            const prodObjectId = new ObjectId(productDetails.prodId);

            // Database update syntax
            db.get().collection(constants.COLLECTION_NAME).updateOne(
                {_id: prodObjectId},
                {
                    $set: {
                        name: productDetails.name,
                        category: productDetails.category,
                        desc: productDetails.desc,
                        price: productDetails.price
                    },
                }
            )
            .then((response) => resolve(response))
            .catch((err) => reject(err));
        });
    },
};
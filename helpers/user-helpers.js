const e = require('express');
const db = require('../config/connection');
const constants = require('../config/constants');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('../app');

module.exports = {
    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            if (!userData) {
                console.log("User data is empty");
                reject("User data is empty....");
                return;
            }
            userData.password = await bcrypt.hash(userData.password, 8);
            db.get().collection(constants.USER_COLLECTION).insertOne(userData)
                .then((result) => {
                    db.get().collection(constants.USER_COLLECTION).findOne({ _id: result.insertedId })
                        .then((insertedUser) => {
                            resolve(insertedUser); // Resolve with the inserted document
                        }).catch((err) => {
                            console.log("Error fetching inserted user: ", err);
                            reject("Error fetching inserted user");
                        });
                }).catch((err) => {
                    console.log("User insertion error: ", err);
                    reject();
                });
        });
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            if (!userData) {
                console.log("User data is empty");
                reject("User data is empty....");
                return;
            }
            let response = {};
            let user = await db.get().collection(constants.USER_COLLECTION).findOne({ email: userData.email });
            if (user) {
                bcrypt.compare(userData.password, user.password)
                    .then((status) => {
                        if (status) {
                            console.log("Login successfull..");
                            response.user = user;
                            response.status = true;
                            resolve(response);
                        } else {
                            console.log("Login failed...");
                            resolve({ status: false });
                        }
                    });
            } else {
                console.log("User not found");
                resolve({ status: false });
            }
        });
    },
    addToCart: (prodId, userId) => {
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(constants.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
            if (userCart) {
                db.get().collection(constants.CART_COLLECTION).updateOne(
                    { user: new ObjectId(userId) },
                    {
                        $push: {
                            products: new ObjectId(prodId)
                        }
                    }
                )
                    .then((response) => resolve(response))
                    .catch((err) => reject(err));
            } else {
                let cartObj = {
                    user: new ObjectId(userId),
                    products: [new ObjectId(prodId)],
                };
                db.get().collection(constants.CART_COLLECTION).insertOne(cartObj)
                    .then((response) => resolve(response))
                    .catch((err) => reject(err));
            }
        });
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            //  Here we use the aggregate the function of mongodb to return cart products of a particular user
            // First we fetch the cart products that matches with the userId
            // Then we lookup the products collection for the products details (look up is like join in SQL)
            // Now we take the list of product ids from cart collection and place it in products variable
            // Pipeline is created for writing queries
            // Inside pipeline we check for the product id from the product collection with the product id in the carts collection
            // And then if match is found it returns the product object
            // The cart items will be stored under the cartItems key
            let cartItems = await db.get().collection(constants.CART_COLLECTION)
            .aggregate(
                [
                    {
                        $match: {user: new ObjectId(userId)}
                    },
                    {
                        $lookup: {
                            from: constants.COLLECTION_NAME,
                            let: {
                                proList: '$products'
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $in: ['$_id', '$$proList']
                                        }
                                    }
                                }
                            ],
                            as: 'cartItems',
                        }
                    }
                ]
            ).toArray();
            resolve(cartItems[0].cartItems);
        });
    },
};
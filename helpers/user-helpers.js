const e = require('express');
const db = require('../config/connection');
const constants = require('../config/constants');
const bcrypt = require('bcrypt');

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
    }
};
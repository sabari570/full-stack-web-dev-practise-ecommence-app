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
        let prodObject = {
            item: new ObjectId(prodId),
            quantity: 1,
        };
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(constants.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
            if (userCart) {
                // looping through the product array and finding out if the product already exists
                // if yes then return the index
                let productExist = userCart.products.findIndex((product) => product.item == prodId);
                console.log("Product exits index: ", productExist);
                if (productExist != -1) {
                    db.get().collection(constants.CART_COLLECTION)
                        .updateOne(
                            {
                                user: new ObjectId(userId),
                                'products.item': new ObjectId(prodId), // updated the 
                            },
                            {
                                $inc: {
                                    // use $ sign whenever your trying to update a value inside an array
                                    // products.$ -> goes into the products array
                                    // then $.quantity -> goes into the quantity part of that object and then increments it
                                    'products.$.quantity': 1 // $inc -> increments the value of the specified field (products.quantity) by 1
                                }
                            })
                        .then((response) => resolve(response))
                        .catch((err) => reject(err));
                } else {
                    db.get().collection(constants.CART_COLLECTION)
                        .updateOne(
                            { user: new ObjectId(userId) },
                            {
                                $push: { products: prodObject }
                            }
                        )
                        .then((response) => resolve(response))
                        .catch((err) => reject(err));
                }
            } else {
                let cartObj = {
                    user: new ObjectId(userId),
                    products: [prodObject],
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
                        // Stage -1: fething the cart items of the particular user
                        {
                            $match: { user: new ObjectId(userId) }
                        },
                        // This stage of aggregation was when the cart contained only product ids in the products list
                        // {
                        //     $lookup: {
                        //         from: constants.COLLECTION_NAME,
                        //         // We cant use localfield with lookup in the case of an array
                        //         // so acces it in this way
                        //         // place the products array from cart onto a variable named proList
                        //         let: {
                        //             proList: '$products'
                        //         },
                        //         pipeline: [
                        //             {
                        //                 $match: {
                        //                     $expr: {
                        //                         // here _id -> is the ids of the products in products collection
                        //                         // proList -> is the ids of productc in the cart collection
                        //                         // proList has the list of product ids
                        //                         // match each product id in products collection with the list of ids in the cart collection proList
                        //                         // $in is used to run a loop and match each of the product ids in the list
                        //                         $in: ['$_id', '$$proList']
                        //                     }
                        //                 }
                        //             }
                        //         ],
                        //         as: 'cartItems',
                        //     }
                        // }

                        // Stage - 2: unwinding the products array
                        // This stage of aggregation is used when the structure of the products array changed
                        // Now the products array has an obeject that contains the product id and the product quantity 
                        {
                            $unwind: '$products'
                        },

                        // Stage - 3: Projecting only the item and the quantity from the resulting object
                        {
                            $project: {
                                item: '$products.item',
                                quantity: '$products.quantity'
                            }
                        },

                        // Stage -4: Using lookup to find the product ids from the products table and obtain the product object
                        {
                            $lookup: {
                                from: constants.COLLECTION_NAME,
                                localField: 'item',
                                foreignField: '_id',
                                as: 'productDetails'
                            },

                        },

                        // Stage - 5: Converting the list of productDetails into a single object
                        {
                            $project: {
                                item: 1,
                                quantity: 1,
                                productDetail: {
                                    $arrayElemAt: ['$productDetails', 0], //$arrayElemAt is used to return a particular element from an array's index mentioned
                                }
                            }
                        }
                    ]
                ).toArray();
            if (cartItems.length === 0) {
                reject("No items in cart");
            } else {
                console.log("Aggregation result: ", cartItems[0]);
                resolve(cartItems);
            }
        });
    },
    getCartProductsCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cartItemsQuantityCount = await db.get().collection(constants.CART_COLLECTION).aggregate([
                // Stage -1: Unwinding the products list
                {
                    $unwind: '$products'
                },

                // Stage - 2: Grouping each of the product and finding the item quantity of each product
                {
                    $group: {
                        _id: '$products.item',
                        totalQuantity: {
                            $sum: "$products.quantity"
                        }
                    }
                },

                // Stage - 3: Considering the whole documents as 1 by keeping the _id= null
                // and then summing up the totalQuantity field
                {
                    $group: {
                        _id: null,
                        totalProductsInCart: {
                            $sum: "$totalQuantity"
                        }
                    }
                }
            ]).toArray();
            if (cartItemsQuantityCount[0]) {
                console.log("cart items total quantity: ", cartItemsQuantityCount[0].totalProductsInCart);
                count = cartItemsQuantityCount[0].totalProductsInCart;
            }
            resolve(count);
        });
    },

    changeProductQuantity: ({ cartId, prodId, count, quantity }) => {
        let integerCount = parseInt(count);
        let integerQuantity = parseInt(quantity);
        return new Promise((resolve, reject) => {
            // this is the case when the product count is 1 and the user clicks on the decrement button
            // so now the product count becomes zero hence we remove the product from the carts
            if (integerQuantity == 1 && integerCount == -1) {
                db.get().collection(constants.CART_COLLECTION)
                    .updateOne(
                        {
                            _id: new ObjectId(cartId)
                        },
                        {

                            // Removing a product from the products array
                            // pull is used to remove and push is used to add
                            // pull from products array the one with the item as the mentioned product id
                            $pull: {
                                products: {
                                    item: new ObjectId(prodId),
                                }
                            }
                        }
                    )
                    .then((response) => {
                        console.log("Response after update: ", response);
                        resolve({ removeProduct: true });
                    })
                    .catch((err) => reject(err));
            } else {
                db.get().collection(constants.CART_COLLECTION)
                    .updateOne(
                        {
                            '_id': new ObjectId(cartId),
                            'products.item': new ObjectId(prodId)
                        },
                        {
                            $inc: {
                                'products.$.quantity': integerCount
                            }
                        }
                    )
                    .then((response) => {
                        console.log("Response after update: ", response);
                        resolve({ status: true });
                    })
                    .catch((err) => reject(err));
            }
        });
    },
    removeProductFromCart: (cartId, prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(constants.CART_COLLECTION)
                .updateOne(
                    {
                        _id: new ObjectId(cartId),
                    },
                    {
                        $pull: {
                            products: {
                                item: new ObjectId(prodId),
                            }
                        }
                    }
                )
                .then((response) => resolve({ removedProduct: true }))
                .catch((err) => reject(err));
        });
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let totalAmount = await db.get().collection(constants.CART_COLLECTION).aggregate(
                [
                    //Stage 1: fetcing the particular users cart
                    {
                        $match: {
                            user: new ObjectId(userId)
                        }
                    },

                    // Stage 2: unwinding the products array
                    {
                        $unwind: '$products'
                    },

                    // Stage 3: projecting only the product id and the quantity
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity',
                        }
                    },

                    // Stage 4: Perfoming lookup and finding the product details from the product collection
                    {
                        $lookup: {
                            from: constants.COLLECTION_NAME,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },

                    // Stage 5: Projecting out the item id, quantity and instead of array we extract the product object
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: {
                                $arrayElemAt: ['$productDetails', 0]
                            }
                        }
                    },

                    // Stage 6: Projecting out only the item, quantity and its price
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            price: '$product.price'
                        }
                    },

                    // Stage 7: Grouping the entire document as a single collection by setting _id as null
                    // and then finding the total amount
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: {
                                    $multiply: [
                                        { $toDouble: '$quantity' },
                                        { $toDouble: '$price' },  // Converting the string price in databse to double type
                                    ]
                                }
                            }
                        }
                    }
                ]
            ).toArray();
            if (totalAmount.length != 0) {
                console.log("TotalAmount: ", totalAmount);
                resolve(totalAmount[0].total);
            } else {
                reject();
            }
        });
    },
    getCartProductsList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(constants.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
            if (cart) {
                resolve(cart.products);
            } else {
                reject();
            }
        });
    },
    placeOrder: (order, products, totalAmount) => {
        return new Promise(async (resolve, reject) => {
            let status = (order['payment-method'] === 'COD') ? 'placed' : 'pending';
            let orderObject = {
                deliveryDetails: {
                    mobile: order.mobile,
                    address: order.address,
                    pincode: order.pincode,
                },
                userId: new ObjectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                status: status,
                totalAmount: totalAmount,
                date: new Date().toLocaleString(),
            };
            db.get().collection(constants.ORDER_COLLECTION).insertOne(orderObject)
                .then((response) => {

                    // After order being placed remove the cart
                    db.get().collection(constants.CART_COLLECTION).deleteOne({ user: new ObjectId(order.userId) })
                    resolve(response.insertedId);
                })
                .catch((err) => reject(err));
        });
    },
    getOrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.get().collection(constants.ORDER_COLLECTION).find({userId: new ObjectId(userId)}).toArray();
            if (orderDetails) {
                console.log("Order details: ", orderDetails);
                resolve(orderDetails);
            } else {
                reject();
            }
        });
    },
    getOrderedProducts: (orderId) => {
        return new Promise(async(resolve, reject) => {
            let orderedProducts = await db.get().collection(constants.ORDER_COLLECTION).aggregate(
                [
                    // Stage 1: fetches all the documents of the given orderId
                    {
                        $match: {
                            _id: new ObjectId(orderId)
                        }
                    },

                    // Stage 2: Unwinds the products array
                    {
                        $unwind: '$products'
                    },

                    // Stage 3: projects only the required details
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },

                    // Stage 4: performing a lookup and then extarcting the product details
                    {
                        $lookup: {
                            from: constants.COLLECTION_NAME,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },

                    // Stage 5: projecting only the necessary details and converting the array to object
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            productDetail: {
                                $arrayElemAt: ['$productDetails', 0]
                            }
                        }
                    }
                ]
            ).toArray();
            if(orderedProducts){
                console.log("Ordered products: ", orderedProducts);
                resolve(orderedProducts);
            }else{
                reject();
            }
        });
    },
};
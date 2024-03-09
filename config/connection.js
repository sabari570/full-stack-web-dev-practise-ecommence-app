const MongoClient = require('mongodb').MongoClient;

// Creating a state variable to store the database object if the database is connected successfully
const state = {
    db: null
};

module.exports.connect = (done) => {
    const connectionURL = "mongodb://localhost:27017";
    const DBNAME = "shopping";
    MongoClient.connect(connectionURL)
    .then((client) => {
        state.db = client.db(DBNAME);
        return done();
    })
    .catch((err) => {
        console.log("Connection error: ", err);
        return done(err);
    });
};

module.exports.get = () => {
    return state.db;
};
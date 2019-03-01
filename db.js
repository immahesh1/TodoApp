const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;   //The ObjectId class is the default primary key for a MongoDB document
                                                    // and is usually found in the _id field in an inserted document
const dbname = "crud_mongodb";
const url = "mongodb://localhost:27017";
const mongoOptions = {useNewUrlParser   :   true};

const state = {
    db : null
};

const connect = (cb) => {
    if(state.db){   // if connected then callback
        cb();
    }else{
        MongoClient.connect(url,mongoOptions,(err,client) => {
            if(err){
                cb(err);
            }else{
                state.db = client.db(dbname);
                cb();
            }
        });
    }
}

//function to get primary key
const getPrimaryKey = (_id) => {
    return ObjectID(_id);
}

const getDB = () => {
    return state.db;
}

module.exports = {getDB, getPrimaryKey, connect};
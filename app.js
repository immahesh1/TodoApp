const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Joi = require('joi');
const path = require('path');
app.use(bodyParser.json());

const db = require('./db');
const collection = "todo";  //table name in general

const schema = Joi.object().keys({
    todo : Joi.string().required()
})

app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});

//getDB is for db connection and collection for the particular collection of db then find({}) means all tables of coll
//then toArray because find() returns all documents in cursor and we don't want into cursor 
app.get('/getTodos', (req,res) => {
    db.getDB().collection(collection).find({}).toArray((err,documents) => {
        if(err)
            console.log(err);
        else{
            console.log(documents);
            res.json(documents);            
        }
    });
});

//for editing the exiting data with _id
app.put('/:id', (req,res) => {
    const todoID = req.params.id;
    const userInput = req.body;
    // findOneAndUpdate(filter, update, options, callback)
    db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(todoID)}, {$set : {todo : userInput.todo} }, {returnOriginal : false}, (err,result) => {
        if(err)
            console.log(err);
        else
            res.json(result);
            
    });
});

//inserting item to db
app.post('/',(req,res,next) => {
    const userInput = req.body;

    Joi.validate(userInput,schema,(err,result) => {
        if(err){
            const error = new Error("Invalid input");
            error.status = 400;
            next(error);
        }else{
            db.getDB().collection(collection).insertOne(userInput,(err,result) => {
                if(err){
                    const error = new Error("Failed to insert todo document.");
                    error.status = 400;
                    next(error);
                }
                else{
                    res.json({result : result, document : result.ops[0], msg:"Successfully inserted Todo!!", error : null});
                }    
            });
        }
    })
   
});

//delete by id
app.delete('/:id',(req,res) => {
    const todoID = req.params.id;

    db.getDB().collection(collection).findOneAndDelete({_id : db.getPrimaryKey(todoID)}, (err,result) => {
        if(err)
            console.log(err);
        else{
            res.json(result);
        }
            
    });
});

app.use((err,req,res,next) => {
    res.status(err.status).json({
        error : {
            message : err.message
        }
    });
})

db.connect((err) => {
    if(err){
        console.log('unable to connect to database');
        process.exit(1);
    }else{
        app.listen(3000, () => {
            console.log('Connected to database successfully!, app listening on port: 3000'); 
        });
    }
    
})

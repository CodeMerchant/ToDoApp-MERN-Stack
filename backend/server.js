const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = express.Router();
const PORT = 4000;

let Todo = require('./todo.model');


//adding middleware
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/todos', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function(){
    console.log("MongoDB database connection established successfully");
})
//bringing in first end point
todoRoutes.route('/').get(function(req,res){
    Todo.find(function(err,todos){
        if(err){
            console.log(err);
        } else {
            res.json(todos);
        }
    });
});


todoRoutes.route('/:id').get(function(req,res){
    let id = req.params.id;
    Todo.findById(id, function(err, todo){
        res.json(todo);
    });
});

todoRoutes.route('/add').post(function(req,res){
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({'todo': 'todo added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});

//adding last end point that is used to update existing items
todoRoutes.route('/update/:id').post(function(req, res){
    //retrieving item that needs to be updated
    Todo.findById(req.params.id, function(err, todo){
        if(!todo){
            res.status(404).send('data not found bruh!!');
        } else 
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;

            //saving it back to the db
            todo.save().then(todo => {
                res.json('Todo updated');
            })

            .catch(err =>{
                res.status(400).send("update not possible");
            });
    });
});

//inserting router
app.use('/todos', todoRoutes);

//starting up server on port 4000
app.listen(PORT, function(){
    console.log("Server is running on Port: " + PORT);
});
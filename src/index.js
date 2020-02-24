const express = require('express')
const User = require('./models/user')
const Task = require('./models/tasks')
// Requiring mongoose.js to initiate connection only, hence not saving it in a const
require('./db/mongoose')

// req.body returned undefined when body-parser was not used
const bodyParser = require('body-parser');

// Gets an instance of express
const app = express()

// Telling express server to use body-parser to be able to read req.body
app.use(bodyParser.json())

// Gets the port from heroku server OR sets to 3000 for local environment
const port = process.env.PORT || 3000

// End point for creating new users
app.post('/users', (req, res)=> {
    // User data is fetched from HTTP request body
    const newUser = new User(req.body)
    // console.log(req);
    
    console.log(req.body);
    //Inserting the new user into database
    newUser.save().then((result)=> {
        // Status 201 for CREATED
        res.status(201).send(result)
    }).catch((error) => {
        // Status 400 for a BAD request
        res.status(400).send(error)
    })
})

// End point for fetching users
app.get('/users', (req, res) => {
    // When query criteria is {}, it returns all the documents in our collection
    User.find({}).then((users) => {
        res.send(users)
    }).catch((error) => {
        res.status(404).send()
    })
})

// End point for fetching a specific user
app.get('/users/:id', (req, res)=> {
    // Getting id from request query params
    const _id = req.params.id
    
    // Finding a user with the passed ID
    User.find({_id}).then((user) => {
        if(!user) {
            // If the user is undefined aka user is not found, sending a 404
            res.status(404).send()
        }
        // Sending back user response if user is found
        res.send(user)
    }).catch((error) => {
        // Sending back a 404 if no user is found for given id
        res.status(404).send()
    })
})

// End point for creating new tasks
app.post('/tasks', (req, res)=> {
    // Creating a Task document model from request
    const task = new Task(req.body)
    console.log(task);
    
    // Inserting the task into database
    task.save().then((result) => {
        // Status 201 for a CREATED response
        res.status(201).send(result)
    }).catch((error) => {
        // Setting status 400 for a BAD request
        res.status(400).send(error)
    })
})

// End point for fetching all the tasks
app.get('/tasks', (req, res) => {
    Task.find().then((tasks) => {
        // Sending back the list of all tasks
        res.send(tasks)
    }).catch((error) => {
        // Sending back a 404 if any error
        res.status(404).send()
    })
})

// End point for fetching a task by ID
app.get('/tasks/:id', (req, res) => {
    // Getting id from request param
    const _id = req.params.id

    // Fetching a task by given ID
    Task.find({_id}).then((task) => {
        if(!task) {
            // Sending a 404 if user is undefined => user is not found
            res.status(404).send()
        }
        // Sending back the task found for given ID
        res.send(task)
    }).catch((error) => {
        // Sending back a 404 if no task is found for given ID
        res.status(404).send()
    })
})

// End point for deleting a task by ID
app.post('/delete-task/:id', (req, res) => {
    // getting the id from request params
    const _id = req.params.id

    // Finding a task of given ID
    Task.findByIdAndDelete({_id}).then((result) => {
        console.log(result);
        return Task.countDocuments({completed: false}).then((tasks) => {
            console.log(tasks);
        }).then((count) => {
            console.log(count);
        }).catch((error) => {
            console.log(error);
        })
    })
})

// Starts the express server on 'port' number
app.listen(port, () => {
    console.log('Server is up on ', port);
})

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
// Async function to user cleaner syntax
app.post('/users', async (req, res) => {
    // User data is fetched from HTTP request body
    const newUser = new User(req.body)
    // console.log(req);    
    //Inserting the new user into database
    try {
        // Treats save() like a synchronous function
        // Execution will be halted till save() is finished
        // Hence next statement send() will be executed only when save() is completed
        await newUser.save()
        res.status(201).send(newUser)
    } catch (error) {
        // Exception in save() => send back a 400
        res.status(400).send(error)
    }
})

// End point for fetching users
app.get('/users', async (req, res) => {
    try {
        // When query criteria is {}, it returns all the documents in our collection
        const users = await User.find({})
        if (!users) {
            // If users is undefined => No user is found
            return res.status(404).send()
        }
        // When find() is completed and users != undefined sends a response
        res.send(users)
    } catch (error) {
        // Exception in find()
        res.status(404).send()
    }



    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((error) => {
    //     res.status(404).send()
    // })
})

// End point for fetching a specific user
app.get('/users/:id', async (req, res) => {
    // Getting id from request query params
    const _id = req.params.id

    try {
        // Finding a user with the passed ID
        const user = await User.find({ _id })
        if (!user) {
            // If the user is undefined aka user is not found, sending a 404
            return res.status(404).send()
        }
        res.status(200).send(user)
    } catch (error) {
        // Exception in find()
        res.status(400).send()
    }

    // User.find({ _id }).then((user) => {
    //     if (!user) {
    //         // If the user is undefined aka user is not found, sending a 404
    //         res.status(404).send()
    //     }
    //     // Sending back user response if user is found
    //     res.send(user)
    // }).catch((error) => {
    //     // Sending back a 404 if no user is found for given id
    //     res.status(404).send()
    // })
})

// End point for creating new tasks
app.post('/tasks', async (req, res) => {
    // Creating a Task document model from request
    const task = new Task(req.body)
    console.log(task);
    try {
        // Inserting the task into database
        await task.save()
        // save() is completed
        res.send(task)
    } catch (error) {
        // Exception in save()
        res.status(400).send(error)
    }
    // Inserting the task into database
    // task.save().then((result) => {
    //     // Status 201 for a CREATED response
    //     res.status(201).send(result)
    // }).catch((error) => {
    //     // Setting status 400 for a BAD request
    //     res.status(400).send(error)
    // })
})

// End point for fetching all the tasks
app.get('/tasks', async (req, res) => {
    try {
        // Fetching all tasks
        const tasks = await Task.find({})
        if (!tasks) {
            // If no task is found for matching criteria tasks will be undefined
            return res.status(404).send()
        }
        // Sending back tasks when find() is finished and tasks is not undefined
        res.send(tasks)
    } catch (error) {
        // Exception in find()
        res.status(400).send(error)
    }
    // Task.find().then((tasks) => {
    //     // Sending back the list of all tasks
    //     res.send(tasks)
    // }).catch((error) => {
    //     // Sending back a 404 if any error
    //     res.status(404).send()
    // })
})

// End point for fetching a task by ID
app.get('/tasks/:id', async (req, res) => {
    // Getting id from request param
    const _id = req.params.id
    try {
        // Fetching a task by given ID
        const task = await Task.find({ _id })

        if (!task) {
            // If no task is found for the given ID, sending back a 404
            return res.status(404).send('No task found')
        }

        // Sending back a task if it is found AND not undefined
        res.send(task)
    } catch (error) {
        // Exception in find()
        res.status(400).send(error)
    }
    //     // Fetching a task by given ID
    //     Task.find({ _id }).then((task) => {
    //         if (!task) {
    //             // Sending a 404 if user is undefined => user is not found
    //             res.status(404).send()
    //         }
    //         // Sending back the task found for given ID
    //         res.send(task)
    //     }).catch((error) => {
    //         // Sending back a 404 if no task is found for given ID
    //         res.status(404).send()
    //     })
    // 
})

// End point for deleting a task by ID
app.post('/delete-task/:id', (req, res) => {
    // getting the id from request params
    const _id = req.params.id

    // Finding a task of given ID
    Task.findByIdAndDelete({ _id }).then((result) => {
        console.log(result);
        return Task.countDocuments({ completed: false }).then((tasks) => {
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

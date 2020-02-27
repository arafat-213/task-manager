const express = require('express')
const Task = require('../models/task')

// Getting a router from express library
const router = new express.Router()

/****************** CREATE *************************/

// End point for creating new tasks
// Async function to user cleaner syntax
router.post('/tasks', async (req, res) => {
    // Creating a Task document model from request
    const task = new Task(req.body)
    // Inserting the new task into database
    try {
        // Execution will be halted till save() is finished
        // Hence next statement send() will be executed only when save() is completed
        await task.save()
        // save() is completed now
        res.send(task)
    } catch (error) {
        // Exception in save()
        res.status(400).send(error)
    }
})

/***************** LIST *************************/

// End point for fetching all the tasks
router.get('/tasks', async (req, res) => {
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
})

/***************** READ *************************/

// End point for fetching a task by ID
router.get('/tasks/:id', async (req, res) => {
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
})

/***************** UPDATE *************************/

// End point for updating a task
router.patch('/tasks/:id', async (req, res) => {
    // Fields from request to be updated
    const fieldsToBeUpdated = Object.keys(req.body)
    // Fileds allowed to be updated
    const allowedUpdates = ['description', 'completed']
    // Checks whether updateFields are from allowedUpdates only
    const isValidOperation = fieldsToBeUpdated.every((update) => allowedUpdates.includes(update))

    // Returns a 400 if not a valid update field
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Inavlid updates!' })
    }

    try {
        // Reading ID from request params
        const _id = req.params.id

        // Updates to be applied
        const updatesToBeApplied = req.body

        // new: true => makes sure findByIdAndUpdate returns update user document
        // runValidator: true => Runs mongooose validation on updates

        // Not using findByIdAndUpdate() as it bypasses mongoose midleware functions eg. pre() and post(), etc.
        // const task = await Task.findByIdAndUpdate(_id, updates, { new: true, runValidators: true })

        // Finding a task for given ID
        const task = await Task.findById(_id)

        // Applying updates to the task object found
        fieldsToBeUpdated.forEach( (field) => task[field] = updatesToBeApplied[field])
        
        // saving  updated task details
        await task.save()

        if (!task) {
            // If no task is found/updated for the given ID
            return res.status(404).send()
        }
        // Sending back a task if found and updated
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

/***************** DELETE *************************/

// End point for deleting a task by ID
router.delete('/tasks/:id', async (req, res) => {
    try {
        // getting the id from request params
        const _id = req.params.id

        // Finding the task by ID and deleting it
        const task = await Task.findByIdAndDelete(_id)

        // If no task is found for the given ID, returns a 404
        if (!task)
            return res.status(404).send()

        // Returns the task if found and deleted
        res.send(task)
    } catch (error) {
        // Exception in findByIdAndDelete() 
        res.status(500).send()
    }
})

// Exporting the task router
module.exports = router
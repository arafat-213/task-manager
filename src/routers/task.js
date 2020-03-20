const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

// Getting a router from express library
const router = new express.Router()

/****************** CREATE *************************/

// End point for creating new tasks
// Async function to user cleaner syntax
router.post('/tasks', auth, async (req, res) => {
    // Creating a Task document model from request
    // const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    // Inserting the new task into database
    try {
        // Execution will be halted till save() is finished
        // Hence next statement send() will be executed only when save() is completed
        await task.save()
        // save() is completed now
        res.status(201).send(task)
    } catch (error) {
        // Exception in save()
        res.status(400).send(error)
    }
})

/***************** LIST *************************/

// End point for fetching multiple tasks created by authenticated user
// GET /tasks => All of the tasks
// GET /tasks?completed=true => Tasks which are completed
// GET /tasks?completed=false => Tasks which are not completed
// GET /tasks?limit=10 => Limits the resulting tasks to  10 tasks (int number) only
// GET /tasks?skip=10 => Skips the first 10 tasks and returns rest of the tasks
// GET /tasks?limit=10&skip10 => Skips first 10 tasks and returns next 10 tasks (11th to 20th task)
// GET /tasks?property:sortStyle => Sorts the tasks by propery in sortStyle order
// GET /tasks?sortBy=createdAt:desc => Sorts the tasks by timestamp of created at. (Descending)
// GET /tasks?sortBy=createdAt:asc => Sorts the tasks by timestamp of created at. (Ascending)
router.get('/tasks', auth, async (req, res) => {
    const match = {}

    const sort = {}
    // Getting the request query parameter 'completed'
    if (req.query.completed) {
        // req.query.completed has string value of 'true' or 'false'
        // It needs to be converted into boolean
        match.completed = req.query.completed === 'true'
    }
    // Getting the request query parameter 'sortBy'
    if (req.query.sortBy) {
        // req.query.sortBy has string value of two params.
        // 1. Property of task by which sorting has to be done
        // 2. Order of sorting => Ascending or Descending
        const parts = req.query.sortBy.split(':')

        // Mongoose has assigned values for sorting in ascending : 1
        //                                             descending : -1
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        // Populating tasks virtual property on user mongoose model
        // This approach does the same
        await req
            .user
            .populate({
                path: 'tasks',
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort
                },
            })
            .execPopulate()

        // Sending back tasks when find() is finished and tasks is not undefined
        res.send(req.user.tasks)
    } catch (error) {
        // Exception in find()
        res.status(400).send(error)
    }
})

/***************** READ *************************/

// End point for fetching a task by ID
router.get('/tasks/:id', auth, async (req, res) => {
    // Getting id from request param
    const _id = req.params.id
    try {
        // Fetching a task by given ID
        // const task = await Task.find({ _id })

        // Finding a task for given ID which was created by currently authenticated user
        const task = await Task.findOne({ _id, owner: req.user._id })

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
router.patch('/tasks/:id', auth, async (req, res) => {
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

        // Finding a task for given task ID and owner's id
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })


        // Applying updates to the task object found
        fieldsToBeUpdated.forEach((field) => task[field] = updatesToBeApplied[field])

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
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // getting the id from request params
        const _id = req.params.id

        // Finding the task by task ID and Owner's id and deleting it
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id })

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
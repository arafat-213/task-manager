const express = require('express')
const User = require('../models/user')

// Getting a router from Express library
const router = new express.Router()

/****************** CREATE *************************/

// End point for creating new users
// Async function to user cleaner syntax
router.post('/users', async (req, res) => {
    // User data is fetched from HTTP request body
    const newUser = new User(req.body)
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

/***************** LIST *************************/

// End point for fetching users
router.get('/users', async (req, res) => {
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
})

/***************** READ *************************/

// End point for fetching a specific user
router.get('/users/:id', async (req, res) => {
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
})

/***************** UPDATE *************************/

// End point for updating user
router.patch('/users/:id', async (req, res) => {
    // Fields from requests to be updated
    const fieldsToBeUpdated = Object.keys(req.body)
    // Fileds allowed to be updated
    const allowedUpdates = ['name', 'email', 'password', 'age']
    // Checks whether updateFileds are from allowedUpdates fileds only
    const isValidOperation = fieldsToBeUpdated.every((update) => allowedUpdates.includes(update))

    // Returns a 400 if not a valid update filed
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Inavlid updates!' })
    }

    try {
        // Reading ID from request params
        const _id = req.params.id

        // Updates to be applied
        const updatesToBeApplied = req.body

        // Options:
        // new: true => makes sure findByIdAndUpdate returns update user document
        // runValidator: true => Runs mongooose validation on updates

        // Not using findByIdAndUpdate as it bypasses mongoose middleware methods ie pre() || post()
        // const user = await User.findByIdAndUpdate(_id, updates, { new: true, runValidators: true })

        // Getting user by id
        const user = await User.findById(_id)

        // Applying the updates to the user object
        fieldsToBeUpdated.forEach((field) => user[field] = updatesToBeApplied[field])

        // saving updated user details
        await user.save()

        if (!user) {
            // If no user is found for the given ID
            return res.status(404).send()
        }
        // Sending back a user if found and updated
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

/***************** DELETE *************************/

// End point for deleting a user
router.delete('/users/:id', async (req, res) => {
    try {
        // getting the id from request params
        const _id = req.params.id

        // Finding the task by ID and deleting it
        const user = await User.findByIdAndDelete(_id)

        // If no task is found for the given ID, returns a 404
        if (!user)
            return res.status(404).send()

        // Returns the task if found and deleted
        res.send(user)
    } catch (error) {
        // Exception in findByIdAndDelete() 
        res.status(500).send()
    }
})

/**************************** LOG IN *************************************/
router.post('/users/login', async (req, res) => {
    try {
        // Getting user email and password
        const email = req.body.email
        const password = req.body.password
        
        // Finding a user with these credentials
        const user = await User.findByCredentials(email, password)
        // Sending user as a response
        res.send(user)
    } catch (error) {
        console.log(error);
        
        res.status(400).send()
    }
})

// Exporting the user router
module.exports = router
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')

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

        // Generating an auth token for new user
        const token = await newUser.generateAuthToken()

        // Storing the token in to new user object
        newUser.tokens = newUser.tokens.concat({ token })

        // Storing the user data into database
        await newUser.save()

        // Setting the status 201 and sending the user back as response
        res.status(201).send({ newUser, token })
    } catch (error) {
        // Exception in save() => send back a 400
        res.status(400).send(error)
    }
})

/***************** READ PROFILE *************************/

// End point for fetching user profile
// Users auth express middleware
router.get('/users/me', auth, async (req, res) => {
    // This function is called only after auth middleware is executed
    // User is authenticated and user object is stored in req.user by auth middleware
    // Sending the user object fetched bu auth middleware as response
    res.send(req.user)
})

/***************** READ *************************/

// End point for fetching a specific user
router.get('/users/:id', auth, async (req, res) => {
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
router.patch('/users/me', auth, async (req, res) => {
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
        // Updates to be applied
        const updatesToBeApplied = req.body

        // Applying the upd ates to the user object
        fieldsToBeUpdated.forEach((field) => req.user[field] = updatesToBeApplied[field])

        // saving updated user details
        await req.user.save()
        // Sending back a user if found and updated
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

/***************** DELETE *************************/

// End point for deleting a user
router.delete('/users/me', auth, async (req, res) => {
    try {
        // req.user is fetched by auth middleware
        // Removing the user from database
        await req.user.remove()

        // Sending the deleted user as response
        res.send(req.user)
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

        // Generating a token
        const token = await user.generateAuthToken()

        // Sending user as a response
        res.send({ user, token })
    } catch (error) {
        console.log(error);

        res.status(400).send()
    }
})


/******************** UPLOAD PROFILE PICTURE *****************************/

// Multer is used to handle form-data such as image files for users' profile pictures.
// Setting up multer instance
const upload = multer({
    limits: {
        // fileSize in bytes, this won't let users upload file larger than 1 Megabytes
        fileSize: 1024000
    },
    // Allows files with certain extensions only
    fileFilter(req, file, callback) {
        // Reg-ex that ensures only image files are accepted.
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please upload an image file'))
        }

        // If the file is valid, accepting it.
        /** callback
         * @params
         * error => undefined if file is acceptable
         * result : Boolean => true if file is to be accepted, false otherwise
         */
        callback(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // Converting the file into png using sharp and resizing it to 250 x 250
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    
    // Saving the binary file on user mongoose model
    req.user.avatar = buffer

    // Saving the user in db
    await req.user.save()


    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

/********************* VIEW PROFILE PICTURE *****************************/
router.get('/users/:id/avatar', async(req, res) => {
    try {
        // Getting the user by ID
        const user = await User.findById(req.params.id)
        
        // If user does not exists or User does not have a profile picture, throws an error
        if (!user || !user.avatar) {
            throw new Error()
        }

        // Setting the content type = image to serve image files in response header
        res.set('Content-Type', 'image/png')

        // Sending back the avatar as response
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

/********************* REMOVE PROFILE PICTURE ***************************/
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send({error})
    }
})

/**************************** LOG OUT ***********************************/
// Logs out user from current session/device only
// If user is logged in multiple devices, other sesions remain active
router.post('/users/logout', auth, async (req, res) => {
    // auth middleware ensures user is logged in before logging out
    try {
        // Removing the current auth token from user object in db
        req.user.tokens = req.user.tokens.filter((token) => token.token != req.token)

        // Saving the user data in db with token removed
        await req.user.save()

        res.send('Logged out')
    } catch (error) {
        res.status(500).send()
    }
})

/************************  LOG OUT ALL  *********************************/
// Logs out the user across all sessions/devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        // Emptying the tokens array to remove all the tokens
        req.user.tokens = []

        // storing the user with removed tokens in db
        await req.user.save()

        res.send('Logged out across all devices')
    } catch (error) {
        res.status(500).send()
    }
})
// Exporting the user router
module.exports = router
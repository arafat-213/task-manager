const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

// Creating user schema for model 'User'
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            default: 0
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid email address')
                }
            }
        },
        password: {
            type: String,
            required: true,
            minlength: 7,
            trim: true,
            validate(value) {
                if (validator.contains(value, 'password'))
                    throw new Error('Password should not contain "Password"')
            }
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }]
    },
    {
        timestamps: true
    }
)

// Adds a virtual property for tasks created by this user on user object when populate() is called
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Custom function to find user by credentials and verifying the user
userSchema.statics.findByCredentials = async (email, password) => {
    // Finding user by the email
    const user = await User.findOne({ email })
    console.log(user);

    // If no user is found, thrwoing an error
    if (!user) {
        throw new Error('Bad credentials')
    }

    // Comparing the entered password with the one in database
    const isMatch = await bcrypt.compare(password, user.password)

    // If passwords do not match, throwing an error
    if (!isMatch) {
        throw new Error('Bad credentials')
    }

    return user
}

// Method on userSchema to generate authentication token
// Not making it a static method as it is applied to individual users and not on entire schema
userSchema.methods.generateAuthToken = async function() {
    // Getting user reference
    const user = this

    // Generating a token for user
    const token = jwt.sign( { _id: user._id.toString() } , 'thisismysecretkey')

    // Adding token to tokens array on user object
    user.tokens = user.tokens.concat({token})

    // saving the user with the token
    await user.save()

    return token
}

// Method on userSchema to return public profile containing non sensitive data of user
// toJSON is called by mongoose every time we return a mongoose object
// Hiding sensitive data here will prevent it from showing up every time 'user' object is returned
userSchema.methods.toJSON = function () {
    // Getting user reference
    const user = this

    // Getting a copy of user mongoose data
    const userObject = user.toObject() 

    // delete operator to delete sensitive data from user profile
    // deleting tokens
    delete userObject.tokens

    // deleting password
    delete userObject.password

    console.log(userObject);
    
    // Returning the filtered user object
    return userObject
}

// This runs before the save() is executed
// Hashing the password before saving it to the database
userSchema.pre('save', async function () {
    // Getting user object
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function() {
    // Getting the user object ref
    const user = this

    // Removing tasks
    Task.deleteMany({owner: user._id})
})


// Creates a Mongoose moodel for document 'User'
const User = mongoose.model('User', userSchema)

// Exporting User model to our app
module.exports = User
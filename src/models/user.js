const mongoose = require('mongoose')
const validator = require('validator')


// Creates a Mongoose moodel for document 'User'
const User = mongoose.model('User', {
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
        validate(value) {
            if(!validator.isEmail(value)) {
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
            if(validator.contains(value, 'password'))
                throw new Error('Password should not contain "Password"')
        }
    }
})

// Exporting User model to our app
module.exports = User
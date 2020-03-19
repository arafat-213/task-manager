const mongoose = require('mongoose')

// Creating task schema for Task model
const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

// Creating the Task model from task schema
const Task = mongoose.model('Task', taskSchema)

module.exports = Task
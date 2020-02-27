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
    }
})

// Creating the Task model from task schema
const Task = mongoose.model('Task', taskSchema)

module.exports = Task
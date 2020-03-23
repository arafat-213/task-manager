const express = require('express')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

// Requiring mongoose.js to initiate connection only, hence not saving it in a const
require('./db/mongoose')

// req.body returned undefined when body-parser was not used
const bodyParser = require('body-parser');

// Gets an instance of express
const app = express()

// Telling express server to use body-parser to be able to read req.body
app.use(bodyParser.json())

// Telling express to use user router
app.use(userRouter)

// Telling express to use task router
app.use(taskRouter)

// exporting app instance
// index.js will boot up the server to run the app
// Test cases only require app instance and works even if server is offline
module.exports = app
const mongoose = require('mongoose')

// Connection URL of the database
const connectionURl = process.env.MONGODB_URL

// Initiating mongodb connection with mongoose instance
mongoose.connect(connectionURl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const mongoose = require('mongoose')

// Connection URL of the database
const connectionURl = 'mongodb://127.0.0.1:27017/task-manager-api'

// Initiating mongodb connection with mongoose instance
mongoose.connect(connectionURl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

// // Creating a User document model data to insert into database
// let Me = new User({
//     name: ' Barfeee   ',
//     email: 'tai.arafaT@gmail.com',
//     age: 21,
    
// })

// // Inserting the data into database
// // save() returns a promise
// Me.save().then( resolve => {
//     console.log('User added');
// }).catch(reject => {
//     console.log('Unable to add user', reject);
// })
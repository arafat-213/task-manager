const express = require('express')
const User = require('./models/user')
// Requiring mongoose.js to initiate connection only, hence not saving it in a const
require('./db/mongoose')


// Gets an instance of express
const app = express()

// Gets the port from heroku server OR sets to 3000 for local environment
const port = process.env.PORT || 3000


// Starts the express server on 'port' number
app.listen(port, () => {
    console.log('Server is up on ', port);
})
//
app.post('/users', (req, res)=> {
    // User data is fetched from HTTP request body
    const newUser = new User(req.body)
    // console.log(req);
    
    console.log(req.body);
    
    console.log(newUser);
    
    //Inserting the new user into database
    newUser.save().then((result)=> {
        res.send(result)
    }).catch((error) => {
        res.send(error)
    })
})

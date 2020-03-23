// Requiring app instance to boot up server
const app = require('./app')

// Gets the port from heroku server OR sets to 3000 for local environment
const port = process.env.PORT

// Starts the express server on 'port' number
app.listen(port, () => {
    console.log('Server is up on ', port);
})

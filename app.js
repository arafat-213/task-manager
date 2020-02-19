const mongodb = require('mongodb')

// MongoClient for accessing the database 
const MongoClient = mongodb.MongoClient

// Connection URL for the database, 'localhost' is malfunctioning hence IP of localhost
const connectionURL = 'mongodb://127.0.0.1:27017'

// Name of the database
const databaseName = 'task-manager'

// Initiating a connection
// Setting useNewUrlParser = true so that IP can be parsed without any issue
MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {
    if(error) {
        return console.log('Unable to connect to the database');
    }
    
    // Getting an instance of task-manager database
    const database = client.db(databaseName)

    // Creates/Reads the collection named 'users' and inserts the passed values as document(s)
    database.collection('users').insertMany([{
        name: 'Tony',
        Age: 46
    }, {
        name: 'Steve',
        Age: 91
    }], (error, result) => {
        if(error) {
            return console.log('Unable to add user to the database');
        }
        console.log(result.ops);
    })
})
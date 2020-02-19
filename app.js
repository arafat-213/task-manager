// MongoClient for accessing the database 
const { MongoClient } = require('mongodb')

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
    // database.collection('users').insertMany([{
    //     name: 'Tony',
    //     Age: 46
    // }, {
    //     name: 'Steve',
    //     Age: 91
    // }], (error, result) => {
    //     if(error) {
    //         return console.log('Unable to add user to the database');
    //     }
    //     console.log(result.ops);
    // })

    // database.collection('kaaam').insertMany([
    //     {
    //         description: 'Shopping',
    //         completed: true
    //     },
    //     {
    //         description: 'Cleaning',
    //         completed: false
    //     },
    //     {
    //         description: 'Sleeping',
    //         completed: false
    //     }
    // ], (error, result) => {
    //     if(error) {
    //         return  console.log('Unable to add kaams');
    //     }
    //     console.log(result.ops);
        
    // })

    // Finds the first kaam which is not completed
    // database.collection('kaaam').findOne({completed: false}, (error, kaaam)=> {
        // if(!error)
        //    console.log(kaaam);
            
    // })

    // Finds all the kaams that are not completed
    // database.collection('kaaam').find({completed: false}).toArray((error, kaaam) => {
    //     console.log(kaaam);
    // })
})
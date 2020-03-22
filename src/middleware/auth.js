const jwt = require('jsonwebtoken')
const User = require('../models/user')
// Middle ware function to authenticate users
const auth = async (req, res, next) => {
    try {
        // Getting the bearer auth token from request header and removing bearer prefix
        const token = req.header('Authorization').replace('Bearer ','')

        // decoded payload for the auth token, throws an error if token is invalid
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Token is valid, finding a user for given id and token
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        // No user is found for the given id and token
        if(!user) {
            throw new Error()
        }

        console.log(user);
        
        // Setting the token on request object so that we don't have to get token in route functions
        req.token = token

        // Setting user object on request object so that we don't have to find user in 'route function' again and again
        req.user = user

        // Route founction is called as the user is authenticated
        next()
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.'})
    }
}

// Exporting the auth function
module.exports = auth
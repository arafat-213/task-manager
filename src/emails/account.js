const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = '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'

// Email address from which emails will be sent
const myEmail = 'tai.arafat.at@gmail.com'

// Setting the API Key on sendgrid instance
sgMail.setApiKey(sendgridAPIKey)

// Object model for the welcome email
// This function is called when a new user is created
/**
 * 
 * @param {string} email => Email address of the user that is created
 * @param {string} name => Name of the user
 */
const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: myEmail,
        subject: 'Welcome to Goa Singhaaammm',
        text: 'Ye gaon mera hai aur me yahan ka Jaykan Shikhre'
    })
}


// Function for the farewell mail
// This function is called when a user is deleted
/**
 * 
 * @param {string} email : Email address of the user
 * @param {string} name : Name of the user
 */
const sendFarewellMail = (email, name) => {
    sgMail.send({
        to: email,
        from: myEmail,
        subject: `Tussi jaa rahe ho ${name} :-(`,
        text: 'Tussi naa jaaaoo yaaaar'
    })
}
// Exporting the email functions
module.exports = {
    sendWelcomeEmail,
    sendFarewellMail
}
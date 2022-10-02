const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: '7n7a7m7e@gmail.com',
        pass: process.env.EMAIL_PASS
    }
});

const mailer = message => {
    transporter.sendMail(message, (err, info) => {
        if(err) {
            return console.log(err);
        }
        console.log('Email sent: ', info);
    })
}

module.exports = mailer




require('dotenv').config()
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.AUTH_USER,
        pass:process.env.AUTH_PASSWORD
    }
})


module.exports = transporter

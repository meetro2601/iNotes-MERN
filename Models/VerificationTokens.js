const mongoose = require('mongoose')

const verificationTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    token:{
        type:String,
        required:true,
    },
    expiresAt:{
        type:Date,
        default: Date.now,
        expires: 600
    }
})


module.exports = mongoose.model('verificationtokens',verificationTokenSchema)
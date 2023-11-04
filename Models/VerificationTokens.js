import { Schema, model } from 'mongoose'

const verificationTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
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


export default model('verificationtokens',verificationTokenSchema)
import { Schema, model } from "mongoose"

const googleUserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    }
})

export default model('googleUsers',googleUserSchema)
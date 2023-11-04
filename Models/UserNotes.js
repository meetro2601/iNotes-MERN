import { Schema, model } from 'mongoose'

const notesSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    tags: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

export default model("notes",notesSchema)
require('dotenv').config()
const mongoose = require('mongoose')

const connectToMongo = ()=>{
        mongoose.connect(process.env.MONGO_ATLAS_URI)
        .then(()=>console.log('Connected'))
        .catch((error)=>console.log(error))
}


module.exports = connectToMongo

import 'dotenv/config'
import { connect } from 'mongoose'

const connectToMongo = ()=>{
        connect(process.env.MONGO_ATLAS_URI)
        .then(()=>console.log('Connected'))
        .catch((error)=>console.log(error))
}


export default connectToMongo

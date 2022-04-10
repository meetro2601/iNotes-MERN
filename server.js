//Importing all the modules
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')

const connectToMongo = require('./db')
connectToMongo()

//initializing app 
const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use('/auth', require('./Routes/Auth'))
app.use('/auth',require('./Routes/GoogleAuth'))
app.use('/notes',require('./Routes/Notes'))
app.use('/password',require('./Routes/Password'))

if(process.env.NODE_ENV == 'production'){
    app.use(express.static(path.join(__dirname,'app','build')))
    app.get('*',(req,res)=>{
        res.sendFile(path.join(__dirname,'app','build','index.html'))
    })
}

const port = process.env.PORT || 2601
//app is listening on port 2601
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})

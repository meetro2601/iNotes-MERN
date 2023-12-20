//Importing all the modules
import 'dotenv/config'
import express, { json } from 'express'
import cors from 'cors'
import { join, resolve } from 'path'
import cookieParser from 'cookie-parser'
import auth from "./Routes/Auth.js"
import googleAuth from "./Routes/GoogleAuth.js"
import notes from "./Routes/Notes.js"
import password from "./Routes/Password.js"
import * as url from 'url';

import connectToMongo from './db.js'
connectToMongo()

//initializing app 
const app = express()
app.use(json())
app.use(cors({
    origin: [process.env.SITE_BASE_URL, "http://localhost:3000"],
    credentials: true
}))
app.use(cookieParser())
app.get("/hello", (req, res) => {
    res.send("hello world")
})
app.use('/auth', auth)
app.use('/auth', googleAuth)
app.use('/notes', notes)
app.use('/password', password)


// const __dirname = url.fileURLToPath(new URL('.', import.meta.url)); //OR
// const __dirname = resolve()

// if (process.env.NODE_ENV == 'production') {
//     console.log(__dirname)
//     app.use(express.static(join(__dirname, 'app', 'build')))
//     app.get('*', (req, res) => {
//         res.sendFile(join(__dirname, 'app', 'build', 'index.html'), (err) => {
//             res.status(500).send(err)
//         })
//     })
// }

const port = process.env.PORT || 2601
//app is listening on port 2601
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})

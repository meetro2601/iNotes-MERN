require('dotenv').config()
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET


const fetchUser = (req, res, next) => {
  // console.log(req.cookies)
  const token = req.cookies.iNotes_jwt || req.cookies.iNotes_google
      jwt.verify(token, JWT_SECRET,(err,data)=>{
        if(err){
          return res.send({error:"Invalid Token"})
        }
        req.user = data.user;
      });
  next();
}; 

module.exports = fetchUser;
import 'dotenv/config'
import pkg from 'jsonwebtoken';
const { verify } = pkg;

const fetchUser = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET
  const token = req.cookies.iNotes_jwt || req.cookies.iNotes_google
  verify(token, JWT_SECRET,(err,data)=>{
        if(err){
          return res.send({error:"Invalid Token"})
        }
        req.user = data.user;
      });
  next();
}; 

export default fetchUser;
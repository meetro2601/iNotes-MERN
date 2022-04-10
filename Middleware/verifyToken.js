require("dotenv").config();
const bcrypt = require("bcryptjs");
const VerificationTokens = require("../Models/VerificationTokens");

const verifyToken = (req, res, next) => {
  
  VerificationTokens.findOne({ userId: req.query.userId })
    .then((result) => {
      if (!result) {
        return res.status(403).json({ valid: false });
      }

      bcrypt.compare(req.query.token, result.token).then((val) => {
        if (val == false) {
          return res.status(403).json({ valid: false });
        }
         req.user = result.userId.toString()
         next();
      });
    })
    .catch((err) => console.log(err));
};

module.exports = verifyToken;

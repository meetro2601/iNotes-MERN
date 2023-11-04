import 'dotenv/config'
import pkg from 'bcryptjs';
import vTokens from "../Models/VerificationTokens.js";

const { compare } = pkg;
const verifyToken = async (req, res, next) => {
  try {
    const result = await vTokens.findOne({ userId: req.query.userId })
    if (!result) {
      return res.status(403).json({ valid: false });
    }

    compare(req.query.token, result.token).then((val) => {
      if (val == false) {
        return res.status(403).json({ valid: false });
      }
      req.user = result.userId.toString()
      next();
    });
  } catch (error) {
    console.log(error)
  }
};

export default verifyToken;

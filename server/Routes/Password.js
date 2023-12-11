import { Router } from "express";
import { randomBytes } from "crypto";
import pkg from 'bcryptjs';
import { body, validationResult } from "express-validator";
const router = Router();
import users from "../Models/Users.js";
import vtokens from "../Models/VerificationTokens.js";
import transporter from "../Emailer.js";
import verifyToken from "../Middleware/verifyToken.js";
const SITE_URL = process.env.SITE_BASE_URL;
const { hash: _hash, genSalt } = pkg;

/*=================================================== */
/*========= Finding user and sending Email @ /forgot-Password ========= */
/*=================================================== */

router.post(
  "/forgot-Password",
  [body("email", "Valid Email Id Required").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ validationError: errors.array()[0].msg });
    }

    try {

      const user = await users.findOne({ email: req.body.email })

      // console.log(user)
      if (!user) {
        return res.status(400).json({ error: "No users found" });
      } else {
        /*====== creating reset token =======*/
        const token = randomBytes(24).toString("hex");
        const hashedT = await _hash(token, 8)
        const resp = await vtokens.updateOne(
          { userId: user._id },
          { $set: { token: hashedT } },
          { upsert: true }
        )

        if (resp.modifiedCount === 0 && resp.upsertedCount === 0) {
          return res.status(500).json({ error: "Some error occured" });
        }
        // console.log(`${SITE_URL}auth/user/resetPassword?user=${user._id}&resetToken=${token}`);
        /*======= Sendign Email with Reset token ========*/
        const mailOptions = {
          from: "meetbr26@gmail.com",
          to: `${user.email}`,
          subject: "iNotes - Reset your Password",
          html: `<p>Hi <b>${user.name},</b></p>
                    <p>Click below to reset your iNotes account password</p>
                    <a href='${SITE_URL}auth/user/resetPassword?user=${user._id}&resetToken=${token}'><p style="display:inline-block;padding:15px;background-color:#2e4e74;border:5px solid #ffae80f7;border-radius:10px;color:white">RESET PASSWORD</p></a>
                    <p>If you did not request a password reset, just ignore this email and continue using your existing password.</p>
                    `,
        };
        await transporter.sendMail(mailOptions)
        res.status(200)
          .json({ message: "Email Sent with Reset link" });
      }
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }

  }
);

/*=================================================== */
/*========= verify user with token @ /verifyUser ========= */
/*=================================================== */

router.post("/verify-resetToken", verifyToken, async (req, res) => {
  if (req.user) {
    const user = await users.findOne({ _id: req.user })
    if (!user) {
      return res.status(403).json({ valid: false });
    }
    return res.status(200).json({ valid: true });
  }
});

/*=================================================== */
/*========= Reset user password @ /reset-Password ========= */
/*=================================================== */

router.put(
  "/reset-Password",
  [
    body("newPassword", "Password must be alteat 6 characters long").isLength({
      min: 6,
    }),
  ],
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ validationError: errors.array()[0].msg });
    }

    try {

      if (req.user) {
        /* ==== new password hashing using bcryptjs ==== */
        const salt = await genSalt(10)
        const hash = await _hash(req.body.newPassword, salt)
        /*==== updating password ====*/
        const result = await users.updateOne(
          { _id: req.user },
          { $set: { password: hash } }
        )
        await vtokens.findOneAndDelete({userId:req.user})

        if (result.modifiedCount !== 0) {
          return res
            .status(200)
            .json({ message: "Password updated successfully" });
        }

      }
    } catch (error) {
      return res
        .status(403)
        .json({ message: "Failed to update password" });
    }
  }
);

export default router;

const express = require("express");
const Crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const Users = require("../Models/Users");
const VerificationTokens = require("../Models/VerificationTokens");
const Transporter = require("../Emailer");
const verifyToken = require("../Middleware/verifyToken");
const SITE_URL = process.env.SITE_BASE_URL;

/*=================================================== */
/*========= Finding user and sending Email @ /forgot-Password ========= */
/*=================================================== */

router.post(
  "/forgot-Password",
  [body("email", "Valid Email Id Required").isEmail()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ validationError: errors.array()[0].msg });
    }

    Users.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
        // console.log(err)
        return res.status(500).send("Internal Server Error");
      } else {
        // console.log(user)
        if (!user) {
          return res.status(400).json({ error: "No users found" });
        } else {
          /*====== creating reset token =======*/
          const token = Crypto.randomBytes(24).toString("hex");

          bcrypt.hash(token, 8, (err, hash) => {
            if (err) {
              return res.status(500).send("Token hashing error");
            }
            VerificationTokens.updateOne(
              { userId: user._id },
              { $set: { token: hash } },
              { upsert: true }
            ).then((resp) => {
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
                    <a href='${SITE_URL}auth/resetPassword/${token}'><p style="display:inline-block;padding:15px;background-color:#2e4e74;border:5px solid #ffae80f7;border-radius:10px;color:white">RESET PASSWORD</p></a>
                    <p>If you did not request a password reset, just ignore this email and continue using your existing password.</p>
                    `,
              };
              Transporter.sendMail(mailOptions, (mailError, info) => {
                if (mailError) {
                  console.log(mailError);
                } else {
                  // console.log(info);
                  res
                  .status(200)
                  .json({ message: "Email Sent with Reset link" });
                }
              });
            })
            .catch((error) => console.log(error));
          })
        }
      }
    });
  }
);

/*=================================================== */
/*========= verify user with token @ /verifyUser ========= */
/*=================================================== */

router.post("/verify-resetToken", verifyToken, (req, res) => {
  if (req.user) {
    Users.findOne({_id:req.user}).then(user =>{
      if(!user){
        return res.status(403).json({ valid: false });
      }
      return res.status(200).json({ valid: true });
    })
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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ validationError: errors.array()[0].msg });
    }

    if (req.user) {
      /* ==== new password hashing using bcryptjs ==== */
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return res.status(500).send("Error in salt generation");
        }
        bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
          if (err) {
            return res.status(500).send("Some error occurred");
          }
          /*==== updating password ====*/
          Users.updateOne(
            { _id: req.user },
            { $set: { password: hash } }
          )
            .then((result) => {
              if (result.modifiedCount === 0) {
                return res
                  .status(403)
                  .json({ message: "Failed to update password" });
              }
              return res
                .status(200)
                .json({ message: "Password updated successfully" });
            })
            .catch((error) => res.status(500));
        });
      });
    }
  }
);

module.exports = router;

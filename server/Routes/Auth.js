import 'dotenv/config'
import { Router } from "express";
import { body, validationResult } from "express-validator";
import pkg from 'bcryptjs';
import jspkg from "jsonwebtoken";
import { randomBytes } from "crypto";
import users from "../Models/Users.js";
import vtokens from "../Models/VerificationTokens.js";
import transporter from "../Emailer.js";
import fetchUser from "../Middleware/fetchuser.js";
import verifyToken from "../Middleware/verifyToken.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const SITE_URL = process.env.SITE_BASE_URL;
const { genSalt, hash: _hash, compare } = pkg
const { sign } = jspkg

/*=================================================== */
/*========= creating a user @ /signup ========= */
/*=================================================== */

router.post(
  "/signup",
  // validating user input with express-validator
  [
    body("email", "Valid Email Id Required").isEmail(),
    body("password", "Password must be alteat 6 characters long").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      /* Check if user already exist */
      const result = await users.findOne({ email: req.body.email })
      if (result) {
        return res.status(400).json({ error: `User already exists` });
      }
      // password hashing using bcryptjs
      const salt = await genSalt(10)

      const hashedPwd = await _hash(req.body.password, salt)

      const user = await users.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPwd,
      })

      /* Generating random token */
      const token = randomBytes(24).toString("hex");
      const hashedTkn = await _hash(token, 8)

      /* Assigning verification token */
      const resp = await vtokens.updateOne(
        { userId: user._id },
        { $set: { token: hashedTkn } },
        { upsert: true }
      )

      if (
        resp.modifiedCount !== 0 ||
        resp.upsertedCount !== 0
      ) {

        // console.log(
        //   `${SITE_URL}/auth/user/emailVerification?user=${user._id}&verificationToken=${token}`
        // );
        /* Sending verification Email */

        const mailOptions = {
          from: "meetbr26@gmail.com",
          to: `${user.email}`,
          subject: "iNotes - Verify your Email",
          html: `<p>Welcome <b>${user.name},</b></p>
                <p>Thanks for registering with iNotes.</p>
                <p>Please confirm your email address by simply clicking on the below link</p>
                <a style='text-decoration: none;' href='${SITE_URL}/auth/user/emailVerification?user=${user._id}&verificationToken=${token}'><p style="color:red;font-size:24px">Verify Email</p></a>
                `,
        };
        await transporter.sendMail(mailOptions)
        return res.status(200).json({ message: "Email Sent" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Unable to Register" });
    }
  }
);

/* ======================================================= */
/* ============== User Login @ /login =============== */
/* ======================================================= */

router.post(
  "/login",
  // validating user input for login with express-validator
  [
    body("email", "Email required").exists(),
    body("password", "Password required").exists(),
  ],
  async (req, res) => {
    // finding a user from database with username
    try {
      const user = await users.findOne({ email: req.body.email }).exec()
      if (!user) {
        return res
          .status(400)
          .json({ error: "Incorrect Email Id or Password" });
      } else {
        //password confimation if user exists
        compare(req.body.password, user.password).then((val) => {
          if (val == false) {
            return res
              .status(400)
              .json({ error: "Incorrect Email Id or Password" });
          }

          //signing a token after user is verified and password confirmation returns true
          sign({ user }, JWT_SECRET, (err, token) => {
            if (err) {
              return res.status(403).send("Token generation error");
            }
            res.cookie("iNotes_jwt", token, { secure: true, httpOnly: true, sameSite: 'none' });
            res.json({ token, user });
          });
        });
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "Unable to Login" });
    }
  }
);

/* ======================================================= */
/* ============== User Email Verification @ /verify-email =============== */
/* ======================================================= */

router.post("/verify-email", verifyToken, async (req, res) => {
  if (req.user) {
    const result = await users.findOneAndUpdate({ _id: req.user }, { $set: { verified: true } })

    if (result) {
      await vtokens.findOneAndDelete({ userId: req.user })
      return res.status(200).send("Verified Successfully");
    } else {
      res.status(400).send("Unable to verify");
    }
  }
});

/* ======================================================= */
/* ============== Resend Verification Email @ /resend-verification-email =============== */
/* ======================================================= */

router.get("/resend-verification-email", async (req, res) => {
  try {
    if (req.query?.userId) {
      console.log(req.query.userId)
      console.log(typeof (req.query.userId))
      const user = await users.findOne({ _id: req.query.userId })
      if (!user) {
        return res
          .status(400)
          .json({ error: "User not found" });
      }

      if (user.verified) {
        return res
          .status(200)
          .json({ message: "Email is already verified" })
      }
      /* Generating random token */
      const token = randomBytes(24).toString("hex");

      const hash = await _hash(token, 8)

      /* ReAssigning verification token */
      const resp = await vtokens.updateOne(
        { userId: user._id },
        { $set: { token: hash } },
        { upsert: true }
      )

      if (resp.modifiedCount !== 0 || resp.upsertedCount !== 0) {
        // console.log(
        //   `${SITE_URL}/auth/user/emailVerification?user=${user._id}&verificationToken=${token}`
        // );
        // return res.status(200).json({ message: "Email Sent" });
        /* ReSending verification Email */
        const mailOptions = {
          from: "meetbr26@gmail.com",
          to: `${user.email}`,
          subject: "iNotes - Verify your Email",
          html: `<p>Welcome <b>${user.name},</b></p>
      <p>Thanks for registering with iNotes.</p>
      <p>Please confirm your email address by simply clicking on the below link</p>
      <a style='text-decoration: none;' href='${SITE_URL}/auth/user/emailVerification?user=${user._id}&verificationToken=${token}'><p style="color:red;font-size:24px">Verify Email</p></a>
      `,
        };

        await transporter.sendMail(mailOptions)
        // console.log(response);
        res.status(200).json({ message: "Email Sent" });
      }
    }
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json({ error: "Unable to send verification Email" });
  }
});

/* =================================================================== */
/* ====== Fetching a user details (Login required) @ /myaccount ====== -*/
/* =================================================================== */

router.post("/myaccount", fetchUser, (req, res) => {
  return res.json(req.user);
});

/* =================================================================== */
/* ====== Logging Out (Login required) @ /logout ====== -*/
/* =================================================================== */

router.get("/logout", (req, res) => {
  res.clearCookie("iNotes_jwt", { secure: true, httpOnly: true, sameSite: 'none' });
  res.clearCookie("iNotes_google", { secure: true, httpOnly: true, sameSite: 'none' });
  return res.status(200).json({ message: "Logged Out Successfully" });
});

export default router;

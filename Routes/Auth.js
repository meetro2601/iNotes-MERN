require("dotenv").config();
const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Crypto = require("crypto");
const Users = require("../Models/Users");
const VerificationTokens = require("../Models/VerificationTokens");
const router = express.Router();
const Transporter = require("../Emailer");
const JWT_SECRET = process.env.JWT_SECRET;
const SITE_URL = process.env.SITE_BASE_URL;

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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    /* Check if user already exist */
    Users.findOne({ email: req.body.email }, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Unable to Register" });
      } else {
        if (result) {
          return res.status(400).json({ error: `User already exists` });
        }
        // password hashing using bcryptjs
        bcrypt.genSalt(10, (saltErr, salt) => {
          if (saltErr) {
            return res.status(500).json({ error: "Unable to Register" });
          }
          bcrypt.hash(req.body.password, salt, (hashErr, hash) => {
            if (hashErr) {
              return res.status(500).json({ error: "Unable to Register" });
            }
            Users.create({
              name: req.body.name,
              email: req.body.email,
              password: hash,
            })
              .then((user) => {
                /* Generating random token */
                const token = Crypto.randomBytes(24).toString("hex");

                bcrypt.hash(token, 8, (err, hash) => {
                  if (err) {
                    return res
                      .status(500)
                      .json({ error: "Unable to Register" });
                  }
                  /* Assigning verification token */
                  VerificationTokens.updateOne(
                    { userId: user._id },
                    { $set: { token: hash } },
                    { upsert: true }
                  )
                    .then((resp) => {
                      if (
                        resp.modifiedCount === 0 &&
                        resp.upsertedCount === 0
                      ) {
                        return res
                          .status(500)
                          .json({ error: "Unable to Register" });
                      }
                      // console.log(
                      //   `${SITE_URL}auth/user/emailVerification?user=${user._id}&verificationToken=${token}`
                      // );
                      /* Sending verification Email */

                      const mailOptions = {
                        from: "meetbr26@gmail.com",
                        to: `${user.email}`,
                        subject: "iNotes - Verify your Email",
                        html: `<p>Welcome <b>${user.name},</b></p>
                <p>Thanks for registering with iNotes.</p>
                <p>Please confirm your email address by simply clicking on the below link</p>
                <a style='text-decoration: none;' href='${SITE_URL}auth/user/emailVerification?user=${user._id}&verificationToken=${token}'><p style="color:red;font-size:32px">Verify Email</p></a>
                `,
                      };
                      Transporter.sendMail(mailOptions, (error, response) => {
                        if (error) {
                          console.log(error);
                        } else {
                          // console.log(response);
                          res.status(200).json({ message: "Email Sent" });
                        }
                      });
                    })
                    .catch((error) => {
                      return res
                        .status(500)
                        .json({ error: "Unable to Register" });
                    });
                });
              })
              .catch((err) => {
                return res.status(500).json({ error: "Register" });
              });
          });
        });
      }
    });
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
  (req, res) => {
    // finding a user from database with username
    Users.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
        return res.status(500).send("Server Error");
      } else {
        if (!user) {
          return res
            .status(400)
            .json({ error: "Incorrect Email Id or Password" });
        } else {
          //password confimation if user exists
          bcrypt.compare(req.body.password, user.password).then((val) => {
            if (val == false) {
              return res
                .status(400)
                .json({ error: "Incorrect Email Id or Password" });
            }
            //signing a token after user is verified and password confirmation returns true
            jwt.sign({ user }, JWT_SECRET, (err, token) => {
              if (err) {
                return res.status(403).send("Token generation error");
              }
              res.cookie("iNotes_jwt", token, { httpOnly: true });
              res.json({ token, user });
            });
          });
        }
      }
    });
  }
);

/* ======================================================= */
/* ============== User Email Verification @ /verify-email =============== */
/* ======================================================= */
const verifyToken = require("../Middleware/verifyToken");

router.post("/verify-email", verifyToken, (req, res) => {
  if (req.user) {
    Users.findOneAndUpdate({ _id: req.user }, { $set: { verified: true } })
      .then((result) => {
        if (result) {
          return res.status(200).send("Verified Successfully");
        }
        res.status(400).send("Unable to verify");
      })
      .catch((err) => res.status(400).send("Unable to verify"));
  }
});

/* ======================================================= */
/* ============== Resend Verification Email @ /resend-verification-email =============== */
/* ======================================================= */

router.get("/resend-verification-email", (req, res) => {
  if (req.query?.userId) {
    Users.findOne({ _id: req.query.userId, verified: false }, (err, user) => {
      if (err) {
        return res
          .status(400)
          .json({ error: "Unable to send verification Email" });
      } else {
        if (!user) {
          return res
            .status(400)
            .json({ error: "Unable to send verification Email" });
        }
        /* Generating random token */
        const token = Crypto.randomBytes(24).toString("hex");

          bcrypt.hash(token, 8, (err, hash) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Unable to send verification Email" });
            }

            /* ReAssigning verification token */
            VerificationTokens.updateOne(
              { userId: user._id },
              { $set: { token: hash } },
              { upsert: true }
            )
              .then((resp) => {
                if (resp.modifiedCount === 0 && resp.upsertedCount === 0) {
                  return res
                    .status(500)
                    .json({ error: "Unable to send verification Email" });
                }
                console.log(
                  `${SITE_URL}auth/user/emailVerification?user=${user._id}&verificationToken=${token}`
                );
                return res.status(200).json({ message: "Email Sent" });
                /* ReSending verification Email */
                /* const mailOptions = {
            from: "meetbr26@gmail.com",
            to: `${user.email}`,
            subject: "iNotes - Verify your Email",
            html: `<p>Welcome <b>${user.name},</b></p>
      <p>Thanks for registering with iNotes.</p>
      <p>Please confirm your email address by simply clicking on the below link</p>
      <a href='${SITE_URL}auth/user/emailVerification?user=${user._id}&verificationToken=${token}'><p style="color:red;text-decoration:none">Verify Email</p></a>
      `,
    };
          Transporter.sendMail(mailOptions, (error, response) => {
            if (error) {
              console.log(error);
            } else {
              // console.log(response);
              res.status(200).json({ message: "Email Sent" });
            }
          }); */
              })
              .catch((error) => {
                return res
                  .status(500)
                  .json({ error: "Unable to send verification Email" });
              });
          });
        
      }
    });
  }
});

/* =================================================================== */
/* ====== Fetching a user details (Login required) @ /myaccount ====== -*/
/* =================================================================== */

const fetchUser = require("../Middleware/fetchuser");

router.post("/myaccount", fetchUser, (req, res) => {
  res.json(req.user);
});

/* =================================================================== */
/* ====== Logging Out (Login required) @ /logout ====== -*/
/* =================================================================== */

router.get("/logout", (req, res) => {
  res.clearCookie("iNotes_jwt");
  res.clearCookie("iNotes_google");
  return res.status(200).json({ message: "Logged Out Successfully" });
});

module.exports = router;

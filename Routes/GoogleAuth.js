require('dotenv').config()
const express = require("express");
const router = express.Router()
const jwt = require('jsonwebtoken')
const googleUsers = require('../Models/GoogleUsers')
const { OAuth2Client } = require("google-auth-library");
const JWT_SECRET = process.env.JWT_SECRET

/* =================================================================== */
/* ====== Fetching a google user details (Google login) @ /google-login ====== */
/* =================================================================== */

const client = new OAuth2Client(process.env.CLIENT_ID);

router.post("/google-login", (req, res) => {
  const { id_token } = req.body;

  client
    .verifyIdToken({ idToken: id_token, audience: process.env.CLIENT_ID })
    .then((resp) => {
      const { name, email } = resp.getPayload();
      googleUsers.findOne({ email }, (err, user) => {
        if (err) {
          return res.status(500).send("Server Error");
        } else {
          if (user) {
            jwt.sign({ user }, JWT_SECRET, (err, token) => {
              if (err) {
                return res.status(403).send("Token generation error");
              }
              res.cookie('iNotes_google',token,{httpOnly:true})
              res.json({ token, user });
            });
          } else {
            googleUsers.create({
              name,
              email,
            }).then((user) =>
              jwt.sign({ user }, JWT_SECRET, (err, token) => {
                if (err) {
                  return res.status(403).send("Token generation error");
                }
                res.cookie('iNotes_google',token,{httpOnly:true})
                res.json({ token, user });
              })
            );
          }
        }
      });
    });
});

module.exports = router
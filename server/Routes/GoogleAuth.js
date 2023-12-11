import 'dotenv/config'
import { Router } from "express";
import jspkg from 'jsonwebtoken';
import gUsers from '../Models/GoogleUsers.js';
import { OAuth2Client } from "google-auth-library";
const JWT_SECRET = process.env.JWT_SECRET
const router = Router()
const { sign } = jspkg

/* =================================================================== */
/* ====== Fetching a google user details (Google login) @ /google-login ====== */
/* =================================================================== */

const client = new OAuth2Client(process.env.CLIENT_ID);

router.post("/google-login", (req, res) => {
  const { id_token } = req.body;
  client
    .verifyIdToken({ idToken: id_token, audience: process.env.CLIENT_ID })
    .then(async (resp) => {
      const { name, email } = resp.getPayload();
      const user = await gUsers.findOne({ email })

      if (user) {
        sign({ user }, JWT_SECRET, (err, token) => {
          if (err) {
            return res.status(403).send("Token generation error");
          }
          res.cookie('iNotes_google', token, { httpOnly: true })
          res.json({ token, user });
        });
      } else {
        const user = await gUsers.create({
          name,
          email,
        })

        if (user) {
          sign({ user }, JWT_SECRET, (err, token) => {
            if (err) {
              return res.status(403).send("Token generation error");
            }
            res.cookie('iNotes_google', token, { httpOnly: true })
            res.json({ token, user });
          })
        }

      }

    })
    .catch(err => {
      console.log(err)
      return res.status(403).send("Google sign in error")});
});

export default router
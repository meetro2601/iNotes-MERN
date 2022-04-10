const express = require("express");
const { body, validationResult } = require("express-validator");
const fetchUser = require("../Middleware/fetchuser");
const UserNotes = require("../Models/UserNotes");
const router = express.Router();


/* ========================================================================== */
/* ====== Geting all notes of user (Login required) @ /getallnotes ===== */
/* ========================================================================== */

router.get("/getallnotes", fetchUser, (req, res) => {
  if(req.user){
    UserNotes.find({ user: req.user._id }, (err, result) => {
      res.send({result,user:req.user});
    });
  }
});

/* ======================================================== */
/* ======= Adding notes (Login required) @ /addNote ======= */ 
/* ======================================================== */

router.post(
  "/addNote",
  // validating user input for note with express-validator
  [
    body("title", "Title must be alteat 4 characters long" 
    ).isLength({ min: 4 }),
    body(
      "description",
      "Description must be alteat 10 characters long"
    ).isLength({ min: 10 }),
  ],
  fetchUser,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // adding a note to mongodb usernotes collection if no validation error exists

    UserNotes.create({
      user: req.user._id,
      title: req.body.title,
      description: req.body.description
    })
      .then((note) => {
        res.json({ note });
      })
      //catching error
      .catch((err) => res.status(400).json({ error: "Failed to add a note" }));
  }
);

/* =========================================================== */
/* ======= Updating a note (Login required) @ /updateNote ======= */
/* =========================================================== */

router.put("/updateNote/:id", fetchUser, (req, res) => {
  // finding a note to be updated by id
  UserNotes.findById(req.params.id, (err, result) => {
    // if note not found
    if (!result) {
      return res.status(404).send("Not Found");
    }

    // if user doesn't own a note
    if (result.user.toString() !== req.user._id) {
      return res.status(401).send("Not Allowed");
    }

    // Updating a note
    UserNotes.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
      (err, result) => {
        if (err) {
          return res.status(500).send("Error Occurred");
        }
        res.send(result);
      }
    );
  });
});

/* =========================================================== */
/* ======= Deleting a note (Login required) @ /deleteNote ======= */
/* =========================================================== */

router.delete("/deleteNote/:id", fetchUser, (req, res) => {
  // finding a note to be deleted by id
  UserNotes.findById(req.params.id, (err, result) => {
    // if note not found
    if (!result) {
      return res.status(404).send("Not Found");
    }

    // if user doesn't own a note
    if (result.user.toString() !== req.user._id) {
      return res.status(401).send("Not Allowed");
    }

    // Deleting a note
    UserNotes.findByIdAndDelete(req.params.id, (err, result) => {
      res.json({ success: "Deleted Successfully", result });
    });
  });
});

module.exports = router;

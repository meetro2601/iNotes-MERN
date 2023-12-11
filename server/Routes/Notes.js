import { Router } from "express";
import { body, validationResult } from "express-validator";
import fetchUser from "../Middleware/fetchuser.js";
import notes from "../Models/UserNotes.js";
const router = Router();


/* ========================================================================== */
/* ====== Geting all notes of user (Login required) @ /getallnotes ===== */
/* ========================================================================== */

router.get("/getallnotes", fetchUser, async (req, res) => {
  if (req.user) {
    const result = await notes.find({ user: req.user._id })
    res.send({ result: result, user: req.user });
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
    // body(
    //   "description",
    //   "Description must be alteat 10 characters long"
    // ).isLength({ min: 10 }),
  ],
  fetchUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // adding a note to mongodb usernotes collection if no validation error exists

    const note = await notes.create({
      user: req.user._id,
      title: req.body.title,
      description: req.body.description
    })
    if (note) {
      res.json({ note });
    } else {
      res.status(400).json({ error: "Failed to add a note" });
    }
  }
);

/* =========================================================== */
/* ======= Updating a note (Login required) @ /updateNote ======= */
/* =========================================================== */

router.put("/updateNote/:id", fetchUser, async (req, res) => {
  try {

    // finding a note to be updated by id
    const result = await notes.findById(req.params.id).exec()

    // if note not found
    if (!result) {
      return res.status(404).send("Not Found");
    }

    // if user doesn't own a note
    if (result.user.toString() !== req.user._id) {
      return res.status(401).send("Not Allowed");
    }

    // Updating a note
    const newResult = await notes.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }).exec()

    res.send(newResult);

  } catch (error) {
    return res.status(500).send("Error Occurred");
  }
});

/* =========================================================== */
/* ======= Deleting a note (Login required) @ /deleteNote ======= */
/* =========================================================== */

router.delete("/deleteNote/:id", fetchUser, async (req, res) => {
  try {

    // finding a note to be deleted by id
    const result = await notes.findById(req.params.id)

    // if note not found
    if (!result) {
      return res.status(404).send("Not Found");
    }

    // if user doesn't own a note
    if (result.user.toString() !== req.user._id) {
      return res.status(401).send("Not Allowed");
    }

    // Deleting a note
    const deleted = await notes.findByIdAndDelete(req.params.id)
    res.json({ success: "Deleted Successfully", deleted })

  } catch (error) {
    console.log(error)
    return res.status(500).send("Error Occurred");
  }
});

export default router;

const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const auth = require("../middleware/auth");

/* GET jobs */
router.get("/", auth, async (req, res) => {
  const jobs = await Job.find({ user: req.user.id });
  res.json(jobs);
});

/* ADD job */
router.post("/", auth, async (req, res) => {
  const newJob = new Job({
    ...req.body,
    user: req.user
  });

  await newJob.save();
  res.json(newJob);
});

/* UPDATE job */
router.put("/:id", auth, async (req, res) => {
  try {
    const update = {};

    if (req.body.status !== undefined) {
      update.status = req.body.status;
    }

    if (req.body.interviewDate !== undefined) {
      update.interviewDate = req.body.interviewDate
        ? new Date(req.body.interviewDate)
        : null;
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    res.json(updatedJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Update failed" });
  }
});
/* DELETE job */
router.delete("/:id", auth, async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

module.exports = router;
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  company: String,
  role: String,

  status: {
    type: String,
    enum: ["Applied", "OA", "Interview", "Rejected"],
    default: "Applied"
  },

  // 🔥 NEW FIELD (IMPORTANT)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  interviewDate:{ 
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Job", jobSchema);
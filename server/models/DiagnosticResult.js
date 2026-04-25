const mongoose = require("mongoose");

const diagnosticResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  aptitudeScore: {
    type: Number,
    required: true,
  },
  dsaScore: {
    type: Number,
    required: true,
  },
  communicationScore: {
    type: Number,
    required: true,
  },
  overallScore: {
    type: Number,
    required: true,
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DiagnosticResult", diagnosticResultSchema);

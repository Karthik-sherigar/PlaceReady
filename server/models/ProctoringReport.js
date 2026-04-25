const mongoose = require("mongoose");

const proctoringReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  diagnosticResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DiagnosticResult",
    required: true,
  },
  violations: [
    {
      violationType: String,
      timestamp: Date,
      sectionName: String,
      questionNumber: Number,
    },
  ],
  totalViolations: {
    type: Number,
    default: 0,
  },
  autoSubmitted: {
    type: Boolean,
    default: false,
  },
  webcamSnapshots: [
    {
      timestamp: Date,
      imageBase64: String,
    },
  ],
  startedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
    default: Date.now,
  },
  trustScore: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("ProctoringReport", proctoringReportSchema);

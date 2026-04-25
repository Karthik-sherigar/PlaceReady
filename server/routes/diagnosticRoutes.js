const express = require("express");
const router = express.Router();
const {
  getQuestions,
  submitDiagnostic,
  getLatestScore,
  getDiagnosticHistory,
} = require("../controllers/diagnosticController");
const { protect } = require("../middleware/authMiddleware");

router.get("/questions", protect, getQuestions);
router.post("/submit", protect, submitDiagnostic);
router.get("/latest", protect, getLatestScore);
router.get("/history", protect, getDiagnosticHistory);

module.exports = router;

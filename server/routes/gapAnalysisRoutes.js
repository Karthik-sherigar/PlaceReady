const express = require("express");
const router = express.Router();
const { getGapAnalysis } = require("../controllers/gapAnalysisController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getGapAnalysis);

module.exports = router;

const express = require("express");
const router = express.Router();
const { generateRoadmap, getRoadmap, updateProgress } = require("../controllers/roadmapController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, generateRoadmap);
router.get("/", protect, getRoadmap);
router.put("/:roadmapId/step/:stepId", protect, updateProgress);

module.exports = router;

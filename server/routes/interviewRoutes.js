const express = require("express");
const router = express.Router();
const { chatInterview, getInterviews } = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/chat", protect, chatInterview);
router.get("/", protect, getInterviews);

module.exports = router;

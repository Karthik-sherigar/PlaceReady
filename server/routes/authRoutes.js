const express = require("express");
const router = express.Router();
const { register, login, getMe, linkCollege, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/link-college", protect, linkCollege);
router.put("/profile", protect, updateProfile);

module.exports = router;

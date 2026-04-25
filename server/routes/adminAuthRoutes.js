const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, getAdminMe } = require("../controllers/adminAuthController");
const { adminProtect } = require("../middleware/adminAuthMiddleware");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/me", adminProtect, getAdminMe);

module.exports = router;

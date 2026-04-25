const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/adminStatsController");
const { adminProtect } = require("../middleware/adminAuthMiddleware");

router.get("/", adminProtect, getAdminStats);

module.exports = router;

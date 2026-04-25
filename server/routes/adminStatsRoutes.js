const express = require("express");
const router = express.Router();
const { getAdminStats, getAdminReports } = require("../controllers/adminStatsController");
const { adminProtect } = require("../middleware/adminAuthMiddleware");

router.get("/", adminProtect, getAdminStats);
router.get("/reports", adminProtect, getAdminReports);

module.exports = router;

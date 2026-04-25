const express = require("express");
const router = express.Router();
const {
  saveReport,
  getReportByDiagnosticId,
} = require("../controllers/proctorController");
const { protect } = require("../middleware/authMiddleware");

router.post("/report", protect, saveReport);
router.get("/report/:diagnosticResultId", protect, getReportByDiagnosticId);

module.exports = router;

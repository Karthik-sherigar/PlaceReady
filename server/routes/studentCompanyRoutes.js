const express = require("express");
const router = express.Router();
const { getStudentCompanies } = require("../controllers/companyController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getStudentCompanies);

module.exports = router;

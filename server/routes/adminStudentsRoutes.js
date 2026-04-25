const express = require("express");
const router = express.Router();
const { getAdminStudents } = require("../controllers/adminStudentsController");
const { adminProtect } = require("../middleware/adminAuthMiddleware");

router.route("/").get(adminProtect, getAdminStudents);

module.exports = router;

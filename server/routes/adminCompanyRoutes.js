const express = require("express");
const router = express.Router();
const {
  createCompany,
  getAdminCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  toggleCompanyStatus,
} = require("../controllers/companyController");
const { adminProtect } = require("../middleware/adminAuthMiddleware");

router.route("/")
  .post(adminProtect, createCompany)
  .get(adminProtect, getAdminCompanies);

router.route("/:id")
  .get(adminProtect, getCompanyById)
  .put(adminProtect, updateCompany)
  .delete(adminProtect, deleteCompany);

router.patch("/:id/toggle-status", adminProtect, toggleCompanyStatus);

module.exports = router;

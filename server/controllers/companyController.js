const Company = require("../models/Company");

// @desc    Create a new company
// @route   POST /api/admin/companies
// @access  Private (Admin)
const createCompany = async (req, res) => {
  try {
    const {
      name,
      tier,
      benchmarks,
      rolesOffered,
      testRoundsDescription,
      packageDetails,
      employmentType,
      workMode,
      isActive,
      upcomingDrive,
    } = req.body;

    if (!name || !tier || !benchmarks) {
      return res.status(400).json({ message: "Name, tier, and benchmarks are required" });
    }

    const companyData = {
      adminId: req.admin._id,
      name,
      tier,
      benchmarks,
      rolesOffered,
      testRoundsDescription,
      packageDetails,
      employmentType,
      workMode,
      isActive,
    };

    if (upcomingDrive && upcomingDrive.date) {
      companyData.upcomingDrive = upcomingDrive;
    }

    const company = await Company.create(companyData);

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all companies for logged in admin
// @route   GET /api/admin/companies
// @access  Private (Admin)
const getAdminCompanies = async (req, res) => {
  try {
    const query = { adminId: req.admin._id };
    
    if (req.query.active === "true") {
      query.isActive = true;
    } else if (req.query.active === "false") {
      query.isActive = false;
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single company for logged in admin
// @route   GET /api/admin/companies/:id
// @access  Private (Admin)
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.params.id, adminId: req.admin._id });
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update company
// @route   PUT /api/admin/companies/:id
// @access  Private (Admin)
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.params.id, adminId: req.admin._id });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const updateData = { ...req.body, updatedAt: Date.now() };
    const updateQuery = { $set: updateData };

    if (updateData.upcomingDrive && !updateData.upcomingDrive.date) {
      delete updateData.upcomingDrive;
      updateQuery.$unset = { upcomingDrive: 1 };
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true, runValidators: true }
    );

    res.json(updatedCompany);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete company
// @route   DELETE /api/admin/companies/:id
// @access  Private (Admin)
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findOneAndDelete({ _id: req.params.id, adminId: req.admin._id });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Toggle company active status
// @route   PATCH /api/admin/companies/:id/toggle-status
// @access  Private (Admin)
const toggleCompanyStatus = async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.params.id, adminId: req.admin._id });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.isActive = !company.isActive;
    company.updatedAt = Date.now();
    await company.save();

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all active companies for a student's college
// @route   GET /api/companies
// @access  Private (Student)
const getStudentCompanies = async (req, res) => {
  try {
    if (!req.user.collegeId) {
      return res.json({ noCollege: true, companies: [] });
    }

    const companies = await Company.find({ adminId: req.user.collegeId, isActive: true });
    res.json({ noCollege: false, companies });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCompany,
  getAdminCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  toggleCompanyStatus,
  getStudentCompanies,
};

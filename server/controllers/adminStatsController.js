const User = require("../models/User");
const Company = require("../models/Company");
const DiagnosticResult = require("../models/DiagnosticResult");

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const adminId = req.admin._id;

    // 1. Total linked students
    const totalStudents = await User.countDocuments({ collegeId: adminId });

    // 2. Total companies added
    const totalCompanies = await Company.countDocuments({ adminId });

    // 3. Students who completed diagnostic test
    // Find all users linked to this admin
    const students = await User.find({ collegeId: adminId }).select("_id");
    const studentIds = students.map((s) => s._id);

    // Count distinct users who have a diagnostic result
    const completedDiagnosticData = await DiagnosticResult.distinct("userId", {
      userId: { $in: studentIds },
    });
    const completedDiagnostic = completedDiagnosticData.length;

    res.json({
      totalStudents,
      totalCompanies,
      completedDiagnostic,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAdminStats };

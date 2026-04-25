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

// @desc    Get admin reports data
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAdminReports = async (req, res) => {
  try {
    const adminId = req.admin._id;

    // Get all students
    const students = await User.find({ collegeId: adminId }).select("_id branch targetRole");
    const studentIds = students.map((s) => s._id);

    // Get all diagnostic results
    const results = await DiagnosticResult.find({ userId: { $in: studentIds } });

    // Aggregate by branch
    const branchStats = {};
    students.forEach(student => {
      const branch = student.branch || 'Unknown';
      if (!branchStats[branch]) branchStats[branch] = { count: 0, totalScore: 0, hasDiag: 0 };
      branchStats[branch].count += 1;
    });

    let totalAptitude = 0;
    let totalDsa = 0;
    let totalCommunication = 0;

    // To keep it simple, we take the latest result per user
    const latestResults = {};
    results.sort((a,b) => b.createdAt - a.createdAt).forEach(result => {
      if (!latestResults[result.userId]) latestResults[result.userId] = result;
    });

    Object.values(latestResults).forEach(result => {
      totalAptitude += result.aptitudeScore;
      totalDsa += result.dsaScore;
      totalCommunication += result.communicationScore;

      // Map back to student to get branch
      const student = students.find(s => s._id.toString() === result.userId.toString());
      if (student) {
         const branch = student.branch || 'Unknown';
         const avg = (result.aptitudeScore + result.dsaScore + result.communicationScore) / 3;
         branchStats[branch].totalScore += avg;
         branchStats[branch].hasDiag += 1;
      }
    });

    const numCompleted = Object.keys(latestResults).length || 1; // avoid div by 0
    const averageScores = {
      aptitude: Math.round(totalAptitude / numCompleted),
      dsa: Math.round(totalDsa / numCompleted),
      communication: Math.round(totalCommunication / numCompleted)
    };

    const branchData = Object.keys(branchStats).map(branch => ({
      name: branch,
      students: branchStats[branch].count,
      averageScore: branchStats[branch].hasDiag > 0 
        ? Math.round(branchStats[branch].totalScore / branchStats[branch].hasDiag) 
        : 0
    }));

    res.json({
      averageScores,
      branchData
    });

  } catch (error) {
    console.error("Error fetching admin reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAdminStats, getAdminReports };

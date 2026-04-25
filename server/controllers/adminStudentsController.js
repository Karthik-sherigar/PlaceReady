const User = require("../models/User");
const DiagnosticResult = require("../models/DiagnosticResult");

// @desc    Get all students for a college admin
// @route   GET /api/admin/students
// @access  Private (Admin)
const getAdminStudents = async (req, res) => {
  try {
    const adminId = req.admin._id;

    // Fetch all users associated with this admin's college
    const students = await User.find({ collegeId: adminId }).select(
      "_id name email branch targetRole createdAt"
    ).lean();

    // Fetch latest diagnostic results for these students
    const studentIds = students.map(s => s._id);
    const diagnosticResults = await DiagnosticResult.find({
      userId: { $in: studentIds }
    }).sort({ createdAt: -1 }).lean();

    // Group diagnostic results by user (getting the latest one since we sorted by desc)
    const latestResults = {};
    diagnosticResults.forEach(result => {
      if (!latestResults[result.userId]) {
        latestResults[result.userId] = result;
      }
    });

    // Merge diagnostic score into student data
    const studentsWithScores = students.map(student => {
      const diag = latestResults[student._id];
      return {
        ...student,
        hasDiagnostic: !!diag,
        diagnosticScore: diag ? Math.round((diag.aptitudeScore + diag.dsaScore + diag.communicationScore) / 3) : null,
        aptitudeScore: diag ? diag.aptitudeScore : null,
        dsaScore: diag ? diag.dsaScore : null,
        communicationScore: diag ? diag.communicationScore : null,
      };
    });

    res.json(studentsWithScores);
  } catch (error) {
    console.error("Error fetching admin students:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAdminStudents };

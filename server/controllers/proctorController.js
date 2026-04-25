const ProctoringReport = require("../models/ProctoringReport");

// @desc    Submit proctoring report
// @route   POST /api/proctor/report
// @access  Private
const saveReport = async (req, res) => {
  try {
    const {
      diagnosticResultId,
      violations,
      totalViolations,
      autoSubmitted,
      webcamSnapshots,
      startedAt,
    } = req.body;

    if (!diagnosticResultId) {
      return res.status(400).json({ message: "diagnosticResultId is required" });
    }

    // Calculate trustScore: ((3 - min(totalViolations, 3)) / 3) * 100
    const clampedViolations = Math.min(totalViolations, 3);
    const trustScore = Math.round(((3 - clampedViolations) / 3) * 100);

    const report = await ProctoringReport.create({
      userId: req.user._id,
      diagnosticResultId,
      violations: violations || [],
      totalViolations: totalViolations || 0,
      autoSubmitted: autoSubmitted || false,
      webcamSnapshots: webcamSnapshots || [],
      startedAt: startedAt || Date.now(),
      endedAt: Date.now(),
      trustScore,
    });

    res.status(201).json({
      message: "Proctoring report saved successfully",
      trustScore,
      reportId: report._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get proctoring report by diagnostic ID
// @route   GET /api/proctor/report/:diagnosticResultId
// @access  Private
const getReportByDiagnosticId = async (req, res) => {
  try {
    const { diagnosticResultId } = req.params;

    const report = await ProctoringReport.findOne({
      userId: req.user._id,
      diagnosticResultId,
    });

    if (!report) {
      return res.status(404).json({ message: "Proctoring report not found" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  saveReport,
  getReportByDiagnosticId,
};

const DiagnosticResult = require("../models/DiagnosticResult");
const Company = require("../models/Company");

// @desc    Get gap analysis for a student
// @route   GET /api/gap-analysis
// @access  Private (Student)
const getGapAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const collegeId = req.user.collegeId;

    if (!collegeId) {
      return res.json({ noCollege: true });
    }

    // 1. Fetch student's last 5 DiagnosticResults
    const results = await DiagnosticResult.find({ userId })
      .sort({ attemptedAt: -1 })
      .limit(5);

    if (!results || results.length === 0) {
      return res.json({ noData: true });
    }

    const latest = results[0];
    const previous = results.length > 1 ? results[1] : null;

    // 2. Fetch all active companies for the college
    const companies = await Company.find({ adminId: collegeId, isActive: true });

    if (!companies || companies.length === 0) {
      return res.json({ noCompanies: true });
    }

    // 3. Process each company
    let readyCount = 0;
    let almostReadyCount = 0;
    let notReadyCount = 0;

    const blockingCounts = {
      aptitude: 0,
      dsa: 0,
      communication: 0
    };

    const companyAnalysis = companies.map(company => {
      const aptitudeGap = latest.aptitudeScore - company.benchmarks.aptitude;
      const dsaGap = latest.dsaScore - company.benchmarks.dsa;
      const communicationGap = latest.communicationScore - company.benchmarks.communication;

      if (aptitudeGap < 0) blockingCounts.aptitude++;
      if (dsaGap < 0) blockingCounts.dsa++;
      if (communicationGap < 0) blockingCounts.communication++;

      const averageGap = (aptitudeGap + dsaGap + communicationGap) / 3;

      let status = "Not Ready";
      if (aptitudeGap >= 0 && dsaGap >= 0 && communicationGap >= 0) {
        status = "Ready";
        readyCount++;
      } else if (aptitudeGap >= -20 && dsaGap >= -20 && communicationGap >= -20 && averageGap >= -10) {
        status = "Almost Ready";
        almostReadyCount++;
      } else {
        notReadyCount++;
      }

      return {
        _id: company._id,
        name: company.name,
        tier: company.tier,
        benchmarks: company.benchmarks,
        gaps: { 
          aptitude: Math.round(aptitudeGap), 
          dsa: Math.round(dsaGap), 
          communication: Math.round(communicationGap) 
        },
        averageGap: Math.round(averageGap),
        status,
        upcomingDrive: company.upcomingDrive
      };
    });

    // Sort companies: Ready > Almost Ready > Not Ready, then alphabetically
    const statusOrder = { "Ready": 1, "Almost Ready": 2, "Not Ready": 3 };
    companyAnalysis.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.name.localeCompare(b.name);
    });

    // 4. Calculate Average Benchmarks
    const totalCompanies = companies.length;
    const avgBenchmarks = {
      aptitude: Math.round(companies.reduce((sum, c) => sum + c.benchmarks.aptitude, 0) / totalCompanies),
      dsa: Math.round(companies.reduce((sum, c) => sum + c.benchmarks.dsa, 0) / totalCompanies),
      communication: Math.round(companies.reduce((sum, c) => sum + c.benchmarks.communication, 0) / totalCompanies)
    };

    // 5. Weak and Strong Areas
    const weakAreas = [];
    const strongAreas = [];
    
    if (latest.aptitudeScore < avgBenchmarks.aptitude) weakAreas.push("aptitude");
    else strongAreas.push("aptitude");

    if (latest.dsaScore < avgBenchmarks.dsa) weakAreas.push("dsa");
    else strongAreas.push("dsa");

    if (latest.communicationScore < avgBenchmarks.communication) weakAreas.push("communication");
    else strongAreas.push("communication");

    // 6. Focus Priority
    const prioritySkill = Object.keys(blockingCounts).reduce((a, b) => 
      blockingCounts[a] >= blockingCounts[b] ? a : b
    );

    // 7. Trend Deltas
    const trend = {
      attempts: results.map(r => ({
        attemptedAt: r.attemptedAt,
        aptitude: Math.round(r.aptitudeScore),
        dsa: Math.round(r.dsaScore),
        communication: Math.round(r.communicationScore),
        overall: Math.round(r.overallScore)
      })).reverse(),
      aptitudeDelta: previous ? Math.round(latest.aptitudeScore - previous.aptitudeScore) : null,
      dsaDelta: previous ? Math.round(latest.dsaScore - previous.dsaScore) : null,
      communicationDelta: previous ? Math.round(latest.communicationScore - previous.communicationScore) : null
    };

    res.json({
      studentScores: {
        aptitude: Math.round(latest.aptitudeScore),
        dsa: Math.round(latest.dsaScore),
        communication: Math.round(latest.communicationScore),
        overall: Math.round(latest.overallScore),
        lastUpdated: latest.attemptedAt
      },
      trend,
      averageBenchmarks: avgBenchmarks,
      companies: companyAnalysis,
      summary: {
        totalCompanies,
        readyCount,
        almostReadyCount,
        notReadyCount,
        weakAreas,
        strongAreas,
        focusPriority: {
          skill: prioritySkill,
          companiesBlocked: blockingCounts[prioritySkill]
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getGapAnalysis };

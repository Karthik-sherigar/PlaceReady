const { GoogleGenerativeAI } = require("@google/generative-ai");
const Roadmap = require("../models/Roadmap");
const DiagnosticResult = require("../models/DiagnosticResult");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Generate a roadmap for user
// @route   POST /api/roadmap/generate
// @access  Private
const generateRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const targetRole = req.user.targetRole || "Software Engineer";

    // 1. Check if they already have one
    const existingRoadmap = await Roadmap.findOne({ userId });
    if (existingRoadmap) {
      return res.status(400).json({ message: "Roadmap already generated", roadmap: existingRoadmap });
    }

    // 2. Get diagnostic result
    const diagnostic = await DiagnosticResult.findOne({ userId }).sort({ createdAt: -1 });

    let strengths = "";
    let weaknesses = "";

    if (diagnostic) {
      if (diagnostic.aptitudeScore < 60) weaknesses += "Aptitude, ";
      else strengths += "Aptitude, ";
      if (diagnostic.dsaScore < 60) weaknesses += "DSA, ";
      else strengths += "DSA, ";
      if (diagnostic.communicationScore < 60) weaknesses += "Communication, ";
      else strengths += "Communication, ";
    } else {
      weaknesses = "Unknown (No diagnostic taken)";
    }

    // 3. Prompt Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
    const prompt = `
      You are an expert career counselor and placement mentor. Create a highly structured study roadmap for a student aiming for a ${targetRole} role.
      Their weaknesses are: ${weaknesses}.
      Their strengths are: ${strengths}.
      
      Respond STRICTLY in the following JSON format, and nothing else. Ensure the JSON is valid.
      {
        "modules": [
          {
            "moduleName": "e.g. Week 1: Data Structures Basics",
            "steps": [
              {
                "title": "Arrays and Strings",
                "description": "Learn basic array manipulation and string algorithms.",
                "resources": ["GeeksforGeeks Arrays", "LeetCode Easy Array Tag"]
              }
            ]
          }
        ]
      }
      Provide 4 to 5 modules, focusing first on their weaknesses.
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsedData = JSON.parse(text);

    const newRoadmap = await Roadmap.create({
      userId,
      targetRole,
      modules: parsedData.modules
    });

    res.status(201).json(newRoadmap);

  } catch (error) {
    console.error("Error generating roadmap:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get roadmap for user
// @route   GET /api/roadmap
// @access  Private
const getRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id });
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update progress
// @route   PUT /api/roadmap/:roadmapId/step/:stepId
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { roadmapId, stepId } = req.params;
    const { isCompleted } = req.body;

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });

    let totalSteps = 0;
    let completedSteps = 0;

    roadmap.modules.forEach(module => {
      let moduleStepsCompleted = 0;
      module.steps.forEach(step => {
        if (step._id.toString() === stepId) {
          step.isCompleted = isCompleted;
        }
        if (step.isCompleted) moduleStepsCompleted++;
        totalSteps++;
      });
      module.isCompleted = moduleStepsCompleted === module.steps.length;
      completedSteps += moduleStepsCompleted;
    });

    roadmap.progressPercentage = Math.round((completedSteps / totalSteps) * 100);
    await roadmap.save();

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { generateRoadmap, getRoadmap, updateProgress };

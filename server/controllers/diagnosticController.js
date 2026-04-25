const { GoogleGenerativeAI } = require("@google/generative-ai");
const DiagnosticResult = require("../models/DiagnosticResult");
const {
  aptitudeQuestions,
  dsaQuestions,
  communicationPrompts,
} = require("../data/questionsBank");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get diagnostic questions (without correct answers)
// @route   GET /api/diagnostic/questions
// @access  Private
const getQuestions = (req, res) => {
  try {
    // Strip correct answers from MCQ
    const cleanAptitude = aptitudeQuestions.map((q) => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    const cleanDsa = dsaQuestions.map((q) => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    res.json({
      aptitude: cleanAptitude,
      dsa: cleanDsa,
      communication: communicationPrompts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper: Calculate MCQ Score
const calculateMCQScore = (userAnswers, questions) => {
  let correctCount = 0;
  // userAnswers is expected to be an object: { [questionId]: "A" }
  questions.forEach((q) => {
    if (userAnswers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });
  return (correctCount / questions.length) * 100;
};

// Helper: Evaluate Communication via Gemini
const evaluateCommunication = async (userAnswers) => {
  // userAnswers is expected to be an object: { [promptId]: "Student answer text..." }
  let totalScore = 0;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  for (const prompt of communicationPrompts) {
    const answer = userAnswers[prompt.id];

    if (!answer || answer.trim().length < 10) {
      // If answer is empty or too short, score is 0
      totalScore += 0;
      continue;
    }

    const sysInstruction = `You are an expert placement evaluator for software engineering roles. 
Evaluate the following student answer strictly and return ONLY a JSON object, 
no explanation, no markdown.`;

    const promptText = `Evaluate this answer for the prompt: "${prompt.prompt}"
Evaluation criteria: ${prompt.evaluationCriteria}
Student answer: "${answer}"

Return this exact JSON:
{
  "score": <number between 0 and 100>,
  "feedback": "<one sentence of constructive feedback>"
}`;

    try {
      const result = await model.generateContent([
        { text: sysInstruction },
        { text: promptText }
      ]);
      const responseText = result.response.text();
      
      // Clean potential markdown blocks
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const evaluation = JSON.parse(cleanJsonStr);
      
      const score = Number(evaluation.score);
      totalScore += isNaN(score) ? 50 : score;
    } catch (error) {
      console.error(`Gemini Evaluation failed for ${prompt.id}:`, error.message);
      // Fallback to neutral score 50
      totalScore += 50;
    }
  }

  return totalScore / communicationPrompts.length;
};

// @desc    Submit diagnostic answers and calculate scores
// @route   POST /api/diagnostic/submit
// @access  Private
const submitDiagnostic = async (req, res) => {
  try {
    const { aptitudeAnswers, dsaAnswers, communicationAnswers } = req.body;

    if (!aptitudeAnswers || !dsaAnswers || !communicationAnswers) {
      return res.status(400).json({ message: "Incomplete diagnostic data" });
    }

    // Calculate Scores
    const aptitudeScore = calculateMCQScore(aptitudeAnswers, aptitudeQuestions);
    const dsaScore = calculateMCQScore(dsaAnswers, dsaQuestions);
    const communicationScore = await evaluateCommunication(communicationAnswers);

    // Calculate overall score (weighted average: Apt 30%, DSA 40%, Comm 30%)
    const overallScore = Math.round(
      aptitudeScore * 0.3 + dsaScore * 0.4 + communicationScore * 0.3
    );

    // Save to DB
    const result = await DiagnosticResult.create({
      userId: req.user._id,
      aptitudeScore,
      dsaScore,
      communicationScore,
      overallScore,
    });

    res.status(201).json({
      message: "Diagnostic evaluated successfully",
      scores: {
        aptitudeScore,
        dsaScore,
        communicationScore,
        overallScore,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get latest diagnostic score
// @route   GET /api/diagnostic/latest
// @access  Private
const getLatestScore = async (req, res) => {
  try {
    const result = await DiagnosticResult.findOne({ userId: req.user._id }).sort({ attemptedAt: -1 });
    if (!result) {
      return res.status(404).json({ message: "No diagnostic results found" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getQuestions,
  submitDiagnostic,
  getLatestScore,
};

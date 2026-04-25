const { GoogleGenerativeAI } = require("@google/generative-ai");
const MockInterview = require("../models/MockInterview");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Start or continue an interview chat
// @route   POST /api/interview/chat
// @access  Private
const chatInterview = async (req, res) => {
  try {
    const { interviewId, message, type } = req.body;
    const userId = req.user._id;
    const targetRole = req.user.targetRole || "Software Engineer";
    const interviewType = type || "technical";

    let interview;

    if (interviewId) {
      interview = await MockInterview.findById(interviewId);
      if (!interview) return res.status(404).json({ message: "Interview not found" });
    } else {
      interview = await MockInterview.create({
        userId,
        targetRole,
        interviewType,
        messages: []
      });
    }

    if (interview.status === "completed") {
      return res.status(400).json({ message: "Interview already completed" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

    // Build chat history
    let history = [
      {
        role: "user",
        parts: [{ text: `You are an expert technical interviewer at a top tech company. I am interviewing for a ${interview.targetRole} role. This is a ${interview.interviewType} interview. Ask me one question at a time. Evaluate my answers briefly, then ask the next question. Do not provide long explanations unless I ask. If I say "End Interview", provide a summary of my performance and a score out of 100, then say "INTERVIEW_ENDED". Start by welcoming me and asking the first question.` }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready when you are." }]
      }
    ];

    interview.messages.forEach(msg => {
      if (msg.role !== "system") {
        history.push({
          role: msg.role,
          parts: [{ text: msg.content }]
        });
      }
    });

    const chat = model.startChat({ history });

    const result = await chat.sendMessage(message || "Hello, I am ready to start the interview.");
    const responseText = result.response.text();

    // Save messages
    if (message) {
      interview.messages.push({ role: "user", content: message });
    }
    interview.messages.push({ role: "model", content: responseText });

    if (responseText.includes("INTERVIEW_ENDED")) {
      interview.status = "completed";
      
      // Try to extract score if possible
      const scoreMatch = responseText.match(/(\d+)\s*\/\s*100/);
      if (scoreMatch) {
        interview.overallScore = parseInt(scoreMatch[1], 10);
      }
      interview.feedback = responseText;
    }

    await interview.save();

    res.json({
      interviewId: interview._id,
      response: responseText,
      status: interview.status,
      messages: interview.messages
    });

  } catch (error) {
    console.error("Error in mock interview:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all interviews for a user
// @route   GET /api/interview
// @access  Private
const getInterviews = async (req, res) => {
  try {
    const interviews = await MockInterview.find({ userId: req.user._id }).sort({ createdAt: -1 }).select("-messages");
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { chatInterview, getInterviews };

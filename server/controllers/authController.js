const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, branch, targetRole, inviteCode } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists" });
    }

    let collegeId = null;
    let collegeName = null;
    let storedInviteCode = null;

    if (inviteCode && inviteCode.trim() !== "") {
      const admin = await Admin.findOne({ inviteCode: inviteCode.trim() });
      if (admin) {
        collegeId = admin._id;
        collegeName = admin.collegeName;
        storedInviteCode = admin.inviteCode;
      } else {
        return res.status(400).json({ message: "Invalid invite code. Please check with your college placement cell." });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      branch,
      targetRole,
      collegeId,
      collegeName,
      inviteCode: storedInviteCode,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      targetRole: user.targetRole,
      collegeId: user.collegeId,
      collegeName: user.collegeName,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      targetRole: user.targetRole,
      collegeId: user.collegeId,
      collegeName: user.collegeName,
      inviteCode: user.inviteCode,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    branch: req.user.branch,
    targetRole: req.user.targetRole,
    collegeId: req.user.collegeId,
    collegeName: req.user.collegeName,
    inviteCode: req.user.inviteCode,
    createdAt: req.user.createdAt,
  });
};

// @desc    Link user to a college via invite code
// @route   POST /api/auth/link-college
// @access  Private
const linkCollege = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode || inviteCode.trim() === "") {
      return res.status(400).json({ message: "Please provide an invite code" });
    }

    const user = await User.findById(req.user._id);

    if (user.collegeId) {
      return res.status(400).json({ message: "Already linked to a college" });
    }

    const admin = await Admin.findOne({ inviteCode: inviteCode.trim() });
    if (!admin) {
      return res.status(400).json({ message: "Invalid invite code. Please check with your placement cell." });
    }

    user.collegeId = admin._id;
    user.collegeName = admin.collegeName;
    user.inviteCode = admin.inviteCode;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      targetRole: user.targetRole,
      collegeId: user.collegeId,
      collegeName: user.collegeName,
      inviteCode: user.inviteCode,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login, getMe, linkCollege };

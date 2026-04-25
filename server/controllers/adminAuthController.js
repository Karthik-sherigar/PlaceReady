const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Helper to generate a 6-character alphanumeric code
const generateInviteCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate JWT using ADMIN_JWT_SECRET
const generateAdminToken = (id) => {
  return jwt.sign({ id }, process.env.ADMIN_JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new admin (college)
// @route   POST /api/admin/auth/register
// @access  Public
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, collegeName, collegeLocation } = req.body;

    if (!name || !email || !password || !collegeName) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "An admin account with this email already exists" });
    }

    let inviteCode;
    let isUnique = false;
    let retries = 0;

    // Retry loop to ensure inviteCode uniqueness
    while (!isUnique && retries < 10) {
      inviteCode = generateInviteCode();
      const existingCode = await Admin.findOne({ inviteCode });
      if (!existingCode) {
        isUnique = true;
      }
      retries++;
    }

    if (!isUnique) {
       return res.status(500).json({ message: "Failed to generate a unique invite code. Please try again." });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      collegeName,
      collegeLocation,
      inviteCode,
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      collegeName: admin.collegeName,
      inviteCode: admin.inviteCode,
      token: generateAdminToken(admin._id),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "An account with this email or invite code already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login admin
// @route   POST /api/admin/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      collegeName: admin.collegeName,
      inviteCode: admin.inviteCode,
      token: generateAdminToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current admin
// @route   GET /api/admin/auth/me
// @access  Private (Admin)
const getAdminMe = async (req, res) => {
  res.json({
    _id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
    collegeName: req.admin.collegeName,
    collegeLocation: req.admin.collegeLocation,
    inviteCode: req.admin.inviteCode,
    createdAt: req.admin.createdAt,
  });
};

module.exports = { registerAdmin, loginAdmin, getAdminMe };

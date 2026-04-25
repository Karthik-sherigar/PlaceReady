const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
  },
  tier: {
    type: String,
    enum: ["Mass Recruiter", "Mid Tier", "Product Company", "Startup"],
    required: true,
  },
  benchmarks: {
    aptitude: { type: Number, min: 0, max: 100, required: true },
    dsa: { type: Number, min: 0, max: 100, required: true },
    communication: { type: Number, min: 0, max: 100, required: true },
  },
  rolesOffered: {
    type: [String],
    default: [],
  },
  testRoundsDescription: {
    type: String,
  },
  packageDetails: {
    minLPA: { type: Number },
    maxLPA: { type: Number },
    currency: { type: String, default: "INR" },
  },
  employmentType: {
    type: [String],
    enum: ["Full Time", "Part Time", "Internship"],
    default: ["Full Time"],
  },
  workMode: {
    type: [String],
    enum: ["On-site", "Remote", "Hybrid"],
    default: ["On-site"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  upcomingDrive: {
    date: { type: Date },
    time: { type: String },
    venue: { type: String },
    mode: { type: String, enum: ['Online', 'Offline'] }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Company", companySchema);

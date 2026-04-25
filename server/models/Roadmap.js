const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  resources: [
    {
      type: String,
    },
  ],
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const moduleSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  steps: [stepSchema],
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  modules: [moduleSchema],
  progressPercentage: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Roadmap", roadmapSchema);

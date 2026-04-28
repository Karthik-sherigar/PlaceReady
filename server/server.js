const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/health", require("./routes/healthRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin/auth", require("./routes/adminAuthRoutes"));
app.use("/api/admin/companies", require("./routes/adminCompanyRoutes"));
app.use("/api/admin/stats", require("./routes/adminStatsRoutes"));
app.use("/api/admin/students", require("./routes/adminStudentsRoutes"));
app.use("/api/companies", require("./routes/studentCompanyRoutes"));
app.use("/api/diagnostic", require("./routes/diagnosticRoutes"));
app.use("/api/proctor", require("./routes/proctorRoutes"));
app.use("/api/gap-analysis", require("./routes/gapAnalysisRoutes"));
app.use("/api/roadmap", require("./routes/roadmapRoutes"));
app.use("/api/interview", require("./routes/interviewRoutes"));

const PORT = process.env.PORT || 5000;

// Export the Express API for Vercel Serverless Functions
module.exports = app;

// Only start the server locally if not in Vercel
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

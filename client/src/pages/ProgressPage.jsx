import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProgressPage.css";

const ProgressPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStep, setUpdatingStep] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/roadmap", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoadmap(res.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (stepId, currentStatus) => {
    if (!roadmap || updatingStep) return;
    setUpdatingStep(stepId);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `/api/roadmap/${roadmap._id}/step/${stepId}`,
        { isCompleted: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoadmap(res.data);
    } catch (err) {
      console.error("Failed to update progress", err);
    } finally {
      setUpdatingStep(null);
    }
  };

  if (loading) {
    return (
      <div className="progress-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
          Loading your progress...
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="progress-page">
        <div className="progress-header">
          <h1 className="progress-title">Progress Tracker</h1>
          <p className="progress-subtitle">Track your learning journey.</p>
        </div>
        <div style={{ textAlign: "center", padding: "60px", background: "#f8fafc", borderRadius: "8px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <h3 style={{ color: "var(--navy)" }}>No Roadmap Found</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            Generate your AI roadmap first to track your progress and check off completed tasks.
          </p>
          <button
            onClick={() => navigate("/roadmap")}
            style={{ background: "var(--emerald)", color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "15px" }}
          >
            Go to Roadmap →
          </button>
        </div>
      </div>
    );
  }

  const totalSteps = roadmap.modules.reduce((acc, m) => acc + m.steps.length, 0);
  const completedSteps = roadmap.modules.reduce((acc, m) => acc + m.steps.filter(s => s.isCompleted).length, 0);

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1 className="progress-title">Progress Tracker</h1>
        <p className="progress-subtitle">Check off completed tasks and track your study progress.</p>
      </div>

      <div className="progress-overview">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", color: "var(--navy)" }}>Overall Completion</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "14px" }}>
              {completedSteps} of {totalSteps} tasks completed
            </p>
          </div>
          <span style={{ fontSize: "28px", fontWeight: "700", color: "var(--emerald)" }}>
            {roadmap.progressPercentage || 0}%
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${roadmap.progressPercentage || 0}%` }}
          ></div>
        </div>
      </div>

      <div className="module-progress-list">
        {roadmap.modules.map((mod, idx) => {
          const modCompleted = mod.steps.filter(s => s.isCompleted).length;
          const modTotal = mod.steps.length;
          const modPct = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;

          return (
            <div key={idx} className="module-progress-item">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>
                  {mod.isCompleted ? "✅ " : ""}{mod.moduleName}
                </h3>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>
                  {modCompleted}/{modTotal} ({modPct}%)
                </span>
              </div>
              <div className="task-list">
                {mod.steps.map((step) => (
                  <div key={step._id} className="task-item">
                    <input
                      type="checkbox"
                      id={`step-${step._id}`}
                      checked={step.isCompleted}
                      onChange={() => toggleTask(step._id, step.isCompleted)}
                      disabled={updatingStep === step._id}
                    />
                    <label
                      htmlFor={`step-${step._id}`}
                      className={`task-label ${step.isCompleted ? "completed" : ""}`}
                      style={{ cursor: "pointer" }}
                    >
                      {step.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressPage;

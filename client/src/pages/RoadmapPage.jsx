import { useState, useEffect } from "react";
import axios from "axios";
import "./RoadmapPage.css";

const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/roadmap", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Server returns null if no roadmap found (not a 404 error)
      setRoadmap(res.data || null);
      setError("");
    } catch (err) {
      // Only set error for real network/server failures
      if (err.response?.status !== 404) {
        setError("Could not load roadmap. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    setGenerating(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/roadmap/generate", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoadmap(res.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "";
      // If already exists, just fetch it
      if (msg.toLowerCase().includes("already")) {
        await fetchRoadmap();
      } else if (err.response?.status === 429) {
        setError("AI quota exceeded. Please wait a moment and try again.");
      } else {
        setError(msg || "Failed to generate roadmap. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="roadmap-page">
        <div style={{ textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "18px", color: "var(--text-secondary)" }}>Loading your roadmap...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap-page">
      <div className="roadmap-header">
        <div>
          <h1 className="roadmap-title">Personalized Roadmap</h1>
          <p className="roadmap-subtitle">AI-generated study plan tailored to your diagnostic results and target role.</p>
        </div>
        {!roadmap && !generating && (
          <button className="generate-btn" onClick={generateRoadmap}>
            ✨ Generate AI Roadmap
          </button>
        )}
        {roadmap && (
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "14px", color: "var(--emerald)", fontWeight: 600 }}>
              {roadmap.progressPercentage || 0}% Complete
            </span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {generating && (
        <div style={{ textAlign: "center", padding: "60px", background: "#f8fafc", borderRadius: "8px" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>🤖</div>
          <h3 style={{ color: "var(--navy)" }}>Generating your personalized roadmap...</h3>
          <p style={{ color: "var(--text-secondary)" }}>The AI is analyzing your diagnostic scores and target role. This may take up to 30 seconds.</p>
        </div>
      )}

      {!roadmap && !generating && !error && (
        <div style={{ textAlign: "center", padding: "60px", background: "#f8fafc", borderRadius: "8px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
          <h3 style={{ color: "var(--navy)" }}>No Roadmap Yet</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            Generate your personalized AI study plan based on your diagnostic test results and target role.
            <br />
            <strong>Tip:</strong> Complete the Diagnostic Test first for a more targeted roadmap.
          </p>
          <button className="generate-btn" onClick={generateRoadmap}>
            ✨ Generate AI Roadmap
          </button>
        </div>
      )}

      {roadmap && !generating && (
        <div className="roadmap-modules">
          {roadmap.modules.map((mod, idx) => (
            <div key={idx} className={`module-card ${mod.isCompleted ? "completed-module" : ""}`}>
              <h3 className="module-title">
                {mod.isCompleted ? "✅ " : `${idx + 1}. `}{mod.moduleName}
              </h3>
              <div className="module-steps">
                {mod.steps.map((step, sIdx) => (
                  <div key={sIdx} className={`step-item ${step.isCompleted ? "completed" : ""}`}>
                    <h4 className="step-title">{step.title}</h4>
                    <p className="step-desc">{step.description}</p>
                    {step.resources && step.resources.length > 0 && (
                      <div className="resources-list">
                        {step.resources.map((r, rIdx) => (
                          <span key={rIdx} className="resource-tag">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;

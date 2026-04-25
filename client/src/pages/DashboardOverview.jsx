import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getLatestScore } from "../services/diagnosticService";
import { getGapAnalysisData } from "../services/gapAnalysisService";
import axios from "axios";
import {
  ClipboardList,
  Map,
  CheckCircle2,
  Route,
  Mic,
  Building2,
  TrendingUp,
  Zap,
} from "lucide-react";
import "./DashboardOverview.css";

/* ── Helpers ── */
const getScoreStatus = (score) => {
  if (score >= 71) return { label: "Ready to apply", cls: "status--strong" };
  if (score >= 41) return { label: "On the right track", cls: "status--moderate" };
  return { label: "Needs significant preparation", cls: "status--weak" };
};

const getSkillLevel = (score) => {
  if (score >= 70) return { label: "Strong", cls: "skill--strong" };
  if (score >= 50) return { label: "Moderate", cls: "skill--moderate" };
  return { label: "Weak", cls: "skill--weak" };
};

const formatDate = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/* ── Circular Progress ── */
const CircularProgress = ({ score, size = 160, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg
      className="circle-progress"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Background track */}
      <circle
        className="circle-track"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        className="circle-fill"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {/* Score text */}
      <text
        x="50%"
        y="46%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="circle-score"
      >
        {score}
      </text>
      <text
        x="50%"
        y="60%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="circle-label"
      >
        out of 100
      </text>
    </svg>
  );
};

/* ── Main Component ── */
const DashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [scoreData, setScoreData] = useState({
    overall: 0,
    skills: [
      { name: "Aptitude", score: 0, max: 100 },
      { name: "DSA", score: 0, max: 100 },
      { name: "Communication", score: 0, max: 100 },
    ],
    hasDiagnostic: false,
  });
  const [dismissBanner, setDismissBanner] = useState(false);
  const [readyCompanies, setReadyCompanies] = useState([]);
  const [almostCompanies, setAlmostCompanies] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch diagnostic score
      try {
        const data = await getLatestScore();
        if (data) {
          setScoreData({
            overall: data.overallScore,
            hasDiagnostic: true,
            skills: [
              { name: "Aptitude", score: Math.round(data.aptitudeScore), max: 100 },
              { name: "DSA", score: Math.round(data.dsaScore), max: 100 },
              { name: "Communication", score: Math.round(data.communicationScore), max: 100 },
            ],
          });

          // Build activity entry for diagnostic
          const newActivities = [
            { icon: ClipboardList, text: "Diagnostic test completed", time: new Date(data.attemptedAt).toLocaleDateString() }
          ];

          // 2. Fetch roadmap
          try {
            const token = localStorage.getItem("token");
            const rmRes = await axios.get("/api/roadmap", { headers: { Authorization: `Bearer ${token}` } });
            if (rmRes.data) {
              newActivities.push({ icon: Route, text: "Roadmap generated", time: new Date(rmRes.data.createdAt).toLocaleDateString() });
            }
          } catch (_) { /* no roadmap yet */ }

          // 3. Fetch recent interviews
          try {
            const token = localStorage.getItem("token");
            const ivRes = await axios.get("/api/interview", { headers: { Authorization: `Bearer ${token}` } });
            if (ivRes.data && ivRes.data.length > 0) {
              newActivities.push({ icon: Mic, text: "Mock interview attempted", time: new Date(ivRes.data[0].createdAt).toLocaleDateString() });
            }
          } catch (_) { /* no interviews yet */ }

          setActivities(newActivities);
        }
      } catch (err) {
        console.log("No diagnostic score yet.");
      }

      // 4. Fetch gap analysis for company readiness
      try {
        const gapData = await getGapAnalysisData();
        if (gapData && gapData.companies) {
          setReadyCompanies(gapData.companies.filter(c => c.status === "Ready").map(c => c.name));
          setAlmostCompanies(gapData.companies.filter(c => c.status === "Almost Ready").map(c => c.name));
        }
      } catch (_) { /* no gap data yet */ }
    };

    fetchData();
  }, []);

  const status = getScoreStatus(scoreData.overall);

  return (
    <div className="overview">
      {!user?.collegeId && !dismissBanner && (
        <div style={{
          background: "#fffbeb",
          color: "#b45309",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #fde68a",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <strong>🔗 Your account is not linked to a college yet.</strong> Enter your invite code in Profile Settings to unlock Gap Analysis and company benchmarks.
          </div>
          <button 
            onClick={() => setDismissBanner(true)}
            style={{ background: "transparent", border: "none", color: "#b45309", cursor: "pointer", fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 1. Welcome Banner ── */}
      <section className="overview-banner">
        <div className="banner-left">
          <h1 className="banner-greeting">
            Welcome back, <span>{user?.name || "Student"}</span>
          </h1>
          <p className="banner-sub">Here's your placement readiness summary</p>
        </div>
        <div className="banner-date">{formatDate()}</div>
      </section>

      {/* ── 2. Readiness Score ── */}
      <section className="overview-score-card">
        <CircularProgress score={scoreData.overall} />
        <div className="score-info">
          <h2 className="score-heading">Overall Readiness Score</h2>
          <span className={`score-status ${status.cls}`}>{status.label}</span>
        </div>
      </section>

      {/* ── 3. Skill Snapshot ── */}
      <section className="overview-skills">
        <h3 className="section-title">Skill Snapshot</h3>
        <div className="skills-grid">
          {scoreData.skills.map((s) => {
            const level = getSkillLevel(s.score);
            return (
              <div key={s.name} className="skill-card">
                <div className="skill-header">
                  <span className="skill-name">{s.name}</span>
                  <span className={`skill-badge ${level.cls}`}>
                    {level.label}
                  </span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className={`skill-bar-fill ${level.cls}`}
                    style={{ width: `${s.score}%` }}
                  ></div>
                </div>
                <span className="skill-score-text">
                  {s.score} / {s.max}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Company Readiness ── */}
      <section className="overview-companies">
        <h3 className="section-title">
          <Building2 size={18} strokeWidth={2} />
          Company Readiness
        </h3>

        {!user?.collegeId ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Link your college in Profile to see company readiness data.</p>
        ) : !scoreData.hasDiagnostic ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Take the Diagnostic Test to see which companies you are ready for.</p>
        ) : (
          <>
            <div className="company-group">
              <p className="company-label">Ready for</p>
              <div className="company-badges">
                {readyCompanies.length === 0 ? (
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>No companies at Ready level yet. Keep practicing!</span>
                ) : readyCompanies.map((c) => (
                  <span key={c} className="company-badge company-badge--ready">
                    <CheckCircle2 size={14} />
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="company-group">
              <p className="company-label">Almost there</p>
              <div className="company-badges">
                {almostCompanies.length === 0 ? (
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>No companies in the "Almost Ready" range.</span>
                ) : almostCompanies.map((c) => (
                  <span
                    key={c}
                    className="company-badge company-badge--almost"
                    title="Meet their benchmark"
                  >
                    <TrendingUp size={14} />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── 5. Quick Actions ── */}
      <section className="overview-actions">
        <button
          className="action-btn action-btn--primary"
          onClick={() => navigate("/diagnostic/setup")}
        >
          <Zap size={18} strokeWidth={2} />
          Take Diagnostic Test
        </button>
        <button
          className="action-btn action-btn--secondary"
          onClick={() => navigate("/roadmap")}
        >
          <Map size={18} strokeWidth={2} />
          View My Roadmap
        </button>
      </section>

      {/* ── 6. Recent Activity ── */}
      <section className="overview-activity">
        <h3 className="section-title">Recent Activity</h3>
        <div className="activity-list">
          {activities.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No activity yet. Take the diagnostic test to get started!</p>
          ) : activities.map((a, i) => (
            <div key={i} className="activity-item">
              <div className="activity-icon">
                <a.icon size={16} strokeWidth={2} />
              </div>
              <div className="activity-body">
                <span className="activity-text">{a.text}</span>
                <span className="activity-time">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;

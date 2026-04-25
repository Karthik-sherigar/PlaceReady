import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getLatestScore } from "../services/diagnosticService";
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

/* ── Mock Data ── */
const MOCK_SCORE = 62;

const skills = [
  { name: "Aptitude", score: 70, max: 100 },
  { name: "DSA", score: 55, max: 100 },
  { name: "Communication", score: 60, max: 100 },
];

const readyCompanies = ["TCS", "Wipro", "Infosys"];
const almostCompanies = ["Cognizant", "Capgemini"];

const activities = [
  {
    icon: ClipboardList,
    text: "Diagnostic test completed",
    time: "2 days ago",
  },
  {
    icon: Route,
    text: "Roadmap generated",
    time: "2 days ago",
  },
  {
    icon: Mic,
    text: "Mock interview attempted",
    time: "Yesterday",
  },
];

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
    overall: MOCK_SCORE,
    skills: skills,
  });

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const data = await getLatestScore();
        if (data) {
          setScoreData({
            overall: data.overallScore,
            skills: [
              { name: "Aptitude", score: Math.round(data.aptitudeScore), max: 100 },
              { name: "DSA", score: Math.round(data.dsaScore), max: 100 },
              { name: "Communication", score: Math.round(data.communicationScore), max: 100 },
            ],
          });
        }
      } catch (err) {
        // Silently fail to mock data if no real score exists yet
        console.log("No previous diagnostic score found, using mock data.");
      }
    };
    fetchScore();
  }, []);

  const status = getScoreStatus(scoreData.overall);

  return (
    <div className="overview">
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

        <div className="company-group">
          <p className="company-label">Ready for</p>
          <div className="company-badges">
            {readyCompanies.map((c) => (
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
            {almostCompanies.map((c) => (
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
      </section>

      {/* ── 5. Quick Actions ── */}
      <section className="overview-actions">
        <button
          className="action-btn action-btn--primary"
          onClick={() => navigate("/diagnostic")}
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
          {activities.map((a, i) => (
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

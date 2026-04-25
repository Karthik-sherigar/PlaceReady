import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestScore, getProctoringReport } from "../services/diagnosticService";
import { AlertCircle, CheckCircle2, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";

/* ── Circular Progress (Reused/Simplified) ── */
const CircularProgress = ({ score, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
      <circle 
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--emerald)" 
        strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fontWeight="bold" fill="var(--navy)">
        {score}
      </text>
    </svg>
  );
};

const DiagnosticReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [proctorReport, setProctorReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const diagData = await getLatestScore();
        setResult(diagData);
        if (diagData && diagData._id) {
          try {
            const pData = await getProctoringReport(diagData._id);
            setProctorReport(pData);
          } catch (pErr) {
            console.error("Proctor report fetch failed:", pErr);
          }
        }
      } catch (err) {
        console.error("Result fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="auth-loading"><div className="spinner"></div></div>;
  if (!result) return <div>No report found.</div>;

  // Skill Bar Helper
  const getSkillColor = (score) => {
    if (score >= 71) return { color: "var(--emerald)", bg: "var(--emerald-soft)", label: "Strong" };
    if (score >= 41) return { color: "#f59e0b", bg: "#fef3c7", label: "Moderate" };
    return { color: "#ef4444", bg: "#fee2e2", label: "Needs Work" };
  };

  // Trust Score Helper
  const getTrustMeta = (score) => {
    if (score === 100) return { icon: ShieldCheck, color: "var(--emerald)", label: "Fully Trusted" };
    if (score >= 66) return { icon: ShieldAlert, color: "#f59e0b", label: "Minor Violations" };
    if (score >= 33) return { icon: ShieldAlert, color: "#ea580c", label: "Moderate Violations" };
    return { icon: ShieldAlert, color: "#ef4444", label: "High Risk" };
  };

  const tsMeta = proctorReport ? getTrustMeta(proctorReport.trustScore) : null;
  const TrustIcon = tsMeta?.icon;

  const skills = [
    { name: "Aptitude", score: result.aptitudeScore },
    { name: "DSA", score: result.dsaScore },
    { name: "Communication", score: result.communicationScore },
  ];

  return (
    <div className="report-container">
      {proctorReport?.autoSubmitted && (
        <div className="setup-warning" style={{ color: "#b91c1c", borderColor: "#fecaca", background: "#fef2f2" }}>
          <AlertCircle size={18} />
          <strong>⚠️ This test was auto-submitted due to multiple violations. Your results may be incomplete.</strong>
        </div>
      )}

      <h2>Diagnostic Test Report</h2>

      {/* 1. Result Summary */}
      <div className="report-section flex-row">
        <div className="overall-score">
          <h3>Overall Score</h3>
          <CircularProgress score={result.overallScore} />
        </div>
        <div className="skill-breakdown">
          {skills.map(s => {
            const meta = getSkillColor(s.score);
            return (
              <div key={s.name} className="skill-row">
                <div className="skill-row-header">
                  <span>{s.name}</span>
                  <span style={{ color: meta.color, fontWeight: 600 }}>{s.score}/100</span>
                </div>
                <div className="skill-bar-track">
                  <div className="skill-bar-fill" style={{ width: `${s.score}%`, background: meta.color }}></div>
                </div>
                <span className="skill-label" style={{ color: meta.color }}>{meta.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {proctorReport && tsMeta && (
        <>
          {/* 2. Trust Score Section */}
          <div className="report-section trust-section" style={{ borderColor: tsMeta.color }}>
            <div className="trust-badge" style={{ color: tsMeta.color, background: `${tsMeta.color}15` }}>
              <TrustIcon size={32} />
              <div className="trust-info">
                <span className="trust-value">{proctorReport.trustScore}%</span>
                <span className="trust-label">{tsMeta.label}</span>
              </div>
            </div>
            <p className="trust-total">Total violations detected: <strong>{proctorReport.totalViolations}</strong></p>
          </div>

          {/* 3. Violation Summary */}
          <div className="report-section">
            <h3>Violation Summary</h3>
            {proctorReport.violations.length === 0 ? (
              <p className="no-violations"><CheckCircle2 size={16}/> No violations detected ✅</p>
            ) : (
              <div className="violation-list">
                {proctorReport.violations.map((v, i) => (
                  <div key={i} className="violation-row">
                    <AlertCircle size={16} color="#ef4444" />
                    <span className="v-type">{v.violationType}</span>
                    <span className="v-sec">({v.sectionName})</span>
                    <span className="v-time">{new Date(v.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Webcam Snapshots */}
          <div className="report-section">
            <h3>Proctoring Snapshots</h3>
            {proctorReport.webcamSnapshots.length === 0 ? (
              <p className="no-snapshots">No snapshots captured</p>
            ) : (
              <div className="snapshot-strip">
                {proctorReport.webcamSnapshots.map((snap, i) => (
                  <div key={i} className="snap-card">
                    <img src={snap.imageBase64} alt={`Snapshot ${i}`} />
                    <span className="snap-time">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 5. Action Buttons */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
        <button className="nav-btn nav-btn--prev report-next-btn" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </button>
        <button className="nav-btn nav-btn--submit report-next-btn" onClick={() => navigate("/gap-analysis")}>
          View Full Gap Analysis <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
};

export default DiagnosticReport;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { 
  BarChart2, 
  Building2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  X,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import { getGapAnalysisData } from "../services/gapAnalysisService";
import { calculateTimeLeft } from "../utils/driveCountdown";
import "./GapAnalysisPage.css";

const GapAnalysisPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTableFilter, setActiveTableFilter] = useState("All");
  const [selectedRadarCompany, setSelectedRadarCompany] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getGapAnalysisData();
        setData(res);
      } catch (err) {
        console.error("Failed to fetch gap analysis", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading-state">Analyzing your performance...</div>;

  if (data?.noCollege) {
    return (
      <div className="empty-state-container">
        <div className="empty-state-card">
          <Building2 size={64} className="empty-icon" />
          <h2>College Not Linked</h2>
          <p>Please link your college in the profile settings to see how you compare against placement benchmarks.</p>
          <button className="roadmap-btn" onClick={() => navigate("/profile")}>Go to Profile</button>
        </div>
      </div>
    );
  }

  if (data?.noData) {
    return (
      <div className="empty-state-container">
        <div className="empty-state-card">
          <Target size={64} className="empty-icon" />
          <h2>No Diagnostic Data</h2>
          <p>Take the diagnostic test first to see your detailed gap analysis and readiness report.</p>
          <button className="roadmap-btn" onClick={() => navigate("/diagnostic/setup")}>Take Diagnostic Test</button>
        </div>
      </div>
    );
  }

  if (data?.noCompanies) {
    return (
      <div className="empty-state-container">
        <div className="empty-state-card">
          <Building2 size={64} className="empty-icon" />
          <h2>No Companies Added</h2>
          <p>Your college hasn't added any companies yet. Gap analysis will appear once placement benchmarks are uploaded.</p>
        </div>
      </div>
    );
  }

  const { studentScores, trend, averageBenchmarks, companies, summary } = data;

  const barChartData = [
    { name: "Aptitude", "Your Score": studentScores.aptitude, "Avg Benchmark": averageBenchmarks.aptitude },
    { name: "DSA", "Your Score": studentScores.dsa, "Avg Benchmark": averageBenchmarks.dsa },
    { name: "Communication", "Your Score": studentScores.communication, "Avg Benchmark": averageBenchmarks.communication }
  ];

  const filteredCompanies = companies.filter(c => 
    activeTableFilter === "All" || c.status === activeTableFilter.replace("✅ ", "").replace("⚠️ ", "").replace("❌ ", "")
  );

  const getInsight = (skill, score, avg) => {
    const gap = score - avg;
    if (gap > 10) return { text: "Strong — exceeds most benchmarks", class: "insight-strong" };
    if (gap >= 0) return { text: "On track — minor improvement needed", class: "insight-track" };
    if (gap > -15) return { text: "Gap identified — focused practice needed", class: "insight-gap" };
    return { text: "Critical gap — prioritize immediately", class: "insight-critical" };
  };

  const recommendations = {
    aptitude: "Practice 20 aptitude questions daily on IndiaBix or PrepInsta. Focus on Quant and Logic.",
    dsa: "Focus on Arrays, Strings, Sorting. Solve 2 problems daily on LeetCode or GeeksforGeeks.",
    communication: "Practice mock interviews. Record yourself answering common HR questions daily."
  };

  return (
    <div className="gap-analysis">
      {/* Header */}
      <div className="header-section">
        <div>
          <h1>Gap Analysis</h1>
          <p className="subtitle">Detailed breakdown of how your skills compare against company benchmarks</p>
          <div className="disclaimer">
            <Info size={14} /> Benchmarks are approximate community-sourced estimates.
          </div>
        </div>
        <div className="last-updated">
          Last Attempt: {new Date(studentScores.lastUpdated).toLocaleDateString()}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="summary-strip">
        <div className="summary-card">
          <span className="card-title">Readiness Score</span>
          <div className={`readiness-score-circle ${studentScores.overall > 70 ? 'score-high' : studentScores.overall > 40 ? 'score-mid' : 'score-low'}`}>
            {studentScores.overall}
          </div>
        </div>
        <div className="summary-card">
          <span className="card-title">Companies Ready For</span>
          <span className="stat-val green">{summary.readyCount}</span>
          <span className="subtitle">out of {summary.totalCompanies}</span>
        </div>
        <div className="summary-card">
          <span className="card-title">Almost Ready</span>
          <span className="stat-val amber">{summary.almostReadyCount}</span>
          <span className="subtitle">Potential opportunities</span>
        </div>
        <div className="summary-card">
          <span className="card-title">Top Priority Skill</span>
          <span className="priority-skill">{summary.focusPriority.skill}</span>
          <span className={`subtitle ${summary.focusPriority.companiesBlocked >= 3 ? 'stat-val red' : 'stat-val amber'}`} style={{fontSize: '14px'}}>
            Blocking {summary.focusPriority.companiesBlocked} companies
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Your Scores vs Average Company Benchmark</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Bar dataKey="Your Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Avg Benchmark" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {trend.attempts.length >= 2 && (
          <div className="chart-container">
            <h3>
              Your Progress Over Time
              <div className="trend-badges">
                {['aptitude', 'dsa', 'communication'].map(skill => {
                  const delta = trend[`${skill}Delta`];
                  return (
                    <div key={skill} className={`delta-badge ${delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral'}`}>
                      {skill[0].toUpperCase()}: {delta > 0 ? `↑ +${delta}` : delta < 0 ? `↓ ${delta}` : '—'}
                    </div>
                  );
                })}
              </div>
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={trend.attempts} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="attemptedAt" tickFormatter={(str) => new Date(str).toLocaleDateString([], {month:'short', day:'numeric'})} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="aptitude" stroke="#3b82f6" strokeWidth={2} dot={{r: 4}} />
                  <Line type="monotone" dataKey="dsa" stroke="#8b5cf6" strokeWidth={2} dot={{r: 4}} />
                  <Line type="monotone" dataKey="communication" stroke="#f59e0b" strokeWidth={2} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="table-section">
        <h3>Company Readiness Breakdown</h3>
        <div className="table-filters">
          {["All", "✅ Ready", "⚠️ Almost Ready", "❌ Not Ready"].map(tab => (
            <button 
              key={tab} 
              className={`filter-tab ${activeTableFilter === tab ? 'active' : ''}`}
              onClick={() => setActiveTableFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="readiness-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Aptitude Gap</th>
                <th>DSA Gap</th>
                <th>Communication Gap</th>
                <th>Upcoming Drive</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(c => {
                const countdown = c.upcomingDrive?.date 
                  ? calculateTimeLeft(c.upcomingDrive.date, c.upcomingDrive.time)
                  : null;

                return (
                  <tr key={c._id}>
                    <td>
                      <div className="company-cell">
                        <strong>{c.name}</strong>
                        <span className="subtitle" style={{fontSize: '11px'}}>{c.tier}</span>
                      </div>
                    </td>
                    <td>
                      <div className="gap-indicator">
                        <span>{c.benchmarks.aptitude} → {studentScores.aptitude}</span>
                        <span className={`gap-val ${c.gaps.aptitude >= 0 ? 'plus' : 'minus'}`}>
                          {c.gaps.aptitude >= 0 ? `+${c.gaps.aptitude}` : c.gaps.aptitude}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="gap-indicator">
                        <span>{c.benchmarks.dsa} → {studentScores.dsa}</span>
                        <span className={`gap-val ${c.gaps.dsa >= 0 ? 'plus' : 'minus'}`}>
                          {c.gaps.dsa >= 0 ? `+${c.gaps.dsa}` : c.gaps.dsa}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="gap-indicator">
                        <span>{c.benchmarks.communication} → {studentScores.communication}</span>
                        <span className={`gap-val ${c.gaps.communication >= 0 ? 'plus' : 'minus'}`}>
                          {c.gaps.communication >= 0 ? `+${c.gaps.communication}` : c.gaps.communication}
                        </span>
                      </div>
                    </td>
                    <td>
                      {countdown && !countdown.completed ? (
                        <div className="drive-cell active" style={{fontSize: '12px'}}>
                          <div className="drive-timer" style={{fontSize: '13px'}}>{countdown.displayString}</div>
                        </div>
                      ) : <span className="subtitle">—</span>}
                    </td>
                    <td>
                      <span className={`status-badge status-${c.status.toLowerCase().split(' ')[0]}`}>
                        {c.status === "Ready" ? "✅ Ready" : c.status === "Almost Ready" ? "⚠️ Almost Ready" : "❌ Not Ready"}
                      </span>
                    </td>
                    <td>
                      <button className="radar-btn" onClick={() => setSelectedRadarCompany(c)}>
                        <BarChart2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skill Summary Cards */}
      <div className="skill-summary-grid">
        {['aptitude', 'dsa', 'communication'].map(skill => {
          const score = studentScores[skill];
          const avg = averageBenchmarks[skill];
          const gap = score - avg;
          const delta = trend[`${skill}Delta`];
          const insight = getInsight(skill, score, avg);

          return (
            <div key={skill} className="skill-card">
              <div className="skill-header">
                <span className="card-title" style={{textTransform: 'capitalize'}}>{skill}</span>
                <div className={`delta-badge ${delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral'}`}>
                  {delta !== null ? (delta > 0 ? `↑ +${delta}` : delta < 0 ? `↓ ${Math.abs(delta)}` : '—') : 'New'}
                </div>
              </div>
              <div className="skill-score-main">{score}</div>
              <div className="subtitle">Avg Benchmark: {avg}</div>
              <div className={`insight-line ${insight.class}`}>{insight.text}</div>
            </div>
          );
        })}
      </div>

      {/* Action Panel */}
      <div className="action-grid">
        <div className="chart-container">
          <h3>Weak Areas & Action Plan</h3>
          {summary.weakAreas.length === 0 ? (
            <div className="insight-strong" style={{padding: '20px', display: 'flex', gap: '10px', alignItems: 'center'}}>
              <CheckCircle2 />
              <span>You meet benchmarks across all skill areas. Keep it up!</span>
            </div>
          ) : (
            <div>
              {summary.weakAreas.map(skill => (
                <div key={skill} className="weak-area-card">
                  <h4 style={{textTransform: 'capitalize', color: '#991b1b', marginBottom: '8px'}}>{skill}</h4>
                  <p style={{fontSize: '14px', color: '#475569', marginBottom: '12px'}}>
                    You are currently {averageBenchmarks[skill] - studentScores[skill]} points below average.
                  </p>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'flex-start', color: '#1e293b'}}>
                    <Zap size={16} style={{marginTop: '3px', flexShrink: 0}} />
                    <span style={{fontSize: '14px'}}>{recommendations[skill]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="priority-callout">
          <Target size={40} style={{color: '#ef4444', marginBottom: '16px'}} />
          <h3>Focus Priority</h3>
          <p className="priority-skill" style={{marginTop: '12px'}}>{summary.focusPriority.skill}</p>
          <p className="subtitle">
            Improving this skill unlocks <strong>{summary.focusPriority.companiesBlocked}</strong> more companies for you.
          </p>
          <button className="roadmap-btn" onClick={() => navigate("/roadmap")}>
            Generate My Personalized Roadmap <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Radar Modal */}
      {selectedRadarCompany && (
        <div className="modal-overlay" onClick={() => setSelectedRadarCompany(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedRadarCompany(null)}>
              <X size={24} />
            </button>
            <h2 style={{color: 'var(--navy)', marginBottom: '24px'}}>{selectedRadarCompany.name} Comparison</h2>
            <div style={{width: '100%', height: 400}}>
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { subject: 'Aptitude', student: studentScores.aptitude, benchmark: selectedRadarCompany.benchmarks.aptitude, fullMark: 100 },
                  { subject: 'DSA', student: studentScores.dsa, benchmark: selectedRadarCompany.benchmarks.dsa, fullMark: 100 },
                  { subject: 'Communication', student: studentScores.communication, benchmark: selectedRadarCompany.benchmarks.communication, fullMark: 100 },
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Your Score" dataKey="student" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Radar name="Company Benchmark" dataKey="benchmark" stroke="#1e293b" fill="#1e293b" fillOpacity={0.4} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GapAnalysisPage;

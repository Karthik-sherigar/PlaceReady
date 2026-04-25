import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStudentCompanies } from "../services/studentCompanyService";
import { getLatestScore } from "../services/diagnosticService";
import { calculateTimeLeft } from "../utils/driveCountdown";
import { 
  Search, 
  Building2, 
  AlertTriangle, 
  ExternalLink, 
  Clock, 
  ChevronRight,
  Info
} from "lucide-react";
import "./StudentCompanies.css";

const StudentCompanies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState([]);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noCollege, setNoCollege] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [now, setNow] = useState(new Date());

  const tabs = ["All", "Mass Recruiter", "Mid Tier", "Product Company", "Startup"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compData, scoreData] = await Promise.all([
          getStudentCompanies(),
          getLatestScore().catch(() => null) // Ignore 404 if no test taken
        ]);

        if (compData.noCollege) {
          setNoCollege(true);
        } else {
          setCompanies(compData.companies);
        }
        setScores(scoreData);
      } catch (err) {
        console.error("Failed to fetch student data", err);
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

  const getScoreStatus = (type, benchmark) => {
    if (!scores) return "neutral";
    const studentScore = scores[type] || 0;
    return studentScore >= benchmark ? "pass" : "fail";
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "All" || c.tier === activeTab;
    return matchesSearch && matchesTab;
  });

  const companiesWithFutureDrives = companies.filter(c => {
    if (!c.upcomingDrive?.date || !c.upcomingDrive?.time) return false;
    const result = calculateTimeLeft(c.upcomingDrive.date, c.upcomingDrive.time);
    return !result.completed;
  }).length;

  if (loading) return <div className="loading-screen">Loading opportunities...</div>;

  // State 1: Unlinked Student
  if (noCollege) {
    return (
      <div className="empty-state-container">
        <div className="empty-state-card">
          <Building2 size={64} className="empty-icon" />
          <h2>Not Linked to a College</h2>
          <p>You need to link your account to a college via invite code to view placement opportunities and company benchmarks.</p>
          <button className="primary-btn" onClick={() => navigate("/profile")}>
            Link My College
          </button>
        </div>
      </div>
    );
  }

  // State 2: Linked but no companies
  if (companies.length === 0) {
    return (
      <div className="empty-state-container">
        <div className="empty-state-card">
          <Building2 size={64} className="empty-icon" />
          <h2>No Companies Found</h2>
          <p>Your college hasn't added any companies to the portal yet. Check back later for updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-companies">
      <div className="companies-header">
        <div>
          <h1>Companies</h1>
          <p className="subtitle">Active placement opportunities from {user?.collegeName || "your college"}</p>
          <p className="disclaimer">
            <Info size={14} /> Benchmarks shown are approximate estimates. Not official company data.
          </p>
        </div>
      </div>

      {!scores && (
        <div className="diagnostic-banner">
          <div className="banner-content">
            <AlertTriangle size={20} />
            <p>Take the diagnostic test to see how you compare against company benchmarks.</p>
          </div>
          <button className="banner-btn" onClick={() => navigate("/diagnostic/setup")}>
            Take Diagnostic Test <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className="companies-controls">
        <div className="search-row">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by company name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="summary-bar">
            Showing <strong>{filteredCompanies.length}</strong> companies · <strong>{companiesWithFutureDrives}</strong> with upcoming drives
          </div>
        </div>

        <div className="filter-tabs">
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="table-responsive">
        <table className="student-companies-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Roles Offered</th>
              <th>Benchmarks Required</th>
              <th>Package</th>
              <th>Employment & Mode</th>
              <th>Test Process</th>
              <th>Upcoming Drive</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(company => {
              const countdown = company.upcomingDrive?.date 
                ? calculateTimeLeft(company.upcomingDrive.date, company.upcomingDrive.time)
                : null;
                
              return (
                <tr key={company._id}>
                  <td>
                    <div className="company-info">
                      <span className="company-name">{company.name}</span>
                      <span className={`tier-badge tier-${company.tier.replace(/\s+/g, '-').toLowerCase()}`}>
                        {company.tier}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="roles-tags">
                      {company.rolesOffered.slice(0, 3).map(role => (
                        <span key={role} className="role-tag">{role}</span>
                      ))}
                      {company.rolesOffered.length > 3 && (
                        <span className="role-tag more">+{company.rolesOffered.length - 3} more</span>
                      )}
                      {company.rolesOffered.length === 0 && <span className="text-muted">-</span>}
                    </div>
                  </td>
                  <td>
                    <div className="benchmark-chips">
                      <div className={`score-chip score-${getScoreStatus("aptitudeScore", company.benchmarks.aptitude)}`}>
                        <span className="chip-label">APT</span>
                        <span className="chip-val">{company.benchmarks.aptitude}</span>
                      </div>
                      <div className={`score-chip score-${getScoreStatus("dsaScore", company.benchmarks.dsa)}`}>
                        <span className="chip-label">DSA</span>
                        <span className="chip-val">{company.benchmarks.dsa}</span>
                      </div>
                      <div className={`score-chip score-${getScoreStatus("communicationScore", company.benchmarks.communication)}`}>
                        <span className="chip-label">COM</span>
                        <span className="chip-val">{company.benchmarks.communication}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="package-val">
                      {company.packageDetails.minLPA || company.packageDetails.maxLPA ? (
                        `${company.packageDetails.minLPA} - ${company.packageDetails.maxLPA} LPA`
                      ) : (
                        "Not disclosed"
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="meta-tags">
                      {company.employmentType.map(t => <span key={t} className="meta-tag type">{t}</span>)}
                      {company.workMode.map(m => <span key={m} className="meta-tag mode">{m}</span>)}
                    </div>
                  </td>
                  <td>
                    <div className="test-process" title={company.testRoundsDescription}>
                      {company.testRoundsDescription ? (
                        company.testRoundsDescription.length > 60 
                          ? `${company.testRoundsDescription.substring(0, 60)}...`
                          : company.testRoundsDescription
                      ) : "-"}
                    </div>
                  </td>
                  <td>
                    {!countdown ? (
                      <span className="drive-status empty">No Drive Scheduled</span>
                    ) : countdown.completed ? (
                      <div className="drive-info passed">
                        <span className="drive-status completed">Drive Completed</span>
                        <span className="drive-date">
                          {new Date(company.upcomingDrive.date).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="drive-info active" title={company.upcomingDrive.venue || "No venue specified"}>
                        <span className="drive-countdown">{countdown.displayString}</span>
                        <span className="drive-date">
                          {new Date(company.upcomingDrive.date).toLocaleDateString()} at {company.upcomingDrive.time}
                        </span>
                        <span className={`drive-badge ${company.upcomingDrive.mode.toLowerCase()}`}>
                          {company.upcomingDrive.mode}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentCompanies;

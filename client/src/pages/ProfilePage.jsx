import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { linkCollege } from "../services/authService";
import { getDiagnosticHistory } from "../services/diagnosticService";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, updateUserCollege } = useAuth();
  
  const [inviteCode, setInviteCode] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getDiagnosticHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const handleLinkCollege = async () => {
    if (!inviteCode.trim()) {
      setLinkError("Please enter an invite code");
      return;
    }

    setIsLinking(true);
    setLinkError("");
    setLinkSuccess("");

    try {
      const updatedUser = await linkCollege(inviteCode.trim().toUpperCase());
      updateUserCollege(updatedUser.collegeId, updatedUser.collegeName, updatedUser.inviteCode);
      setLinkSuccess(`Successfully linked to ${updatedUser.collegeName}`);
      setInviteCode("");
    } catch (err) {
      setLinkError(err.response?.data?.message || "Invalid invite code. Please check with your placement cell.");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile Settings</h2>

      {/* 1. Personal Information */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Personal Information</h3>
          <button className="edit-btn" title="Coming Soon">Edit</button>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Full Name</span>
            <span className="info-value">{user?.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Branch</span>
            <span className="info-value">{user?.branch || "Not specified"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Target Role</span>
            <span className="info-value">{user?.targetRole || "Not specified"}</span>
          </div>
        </div>
      </section>

      {/* 2. College Linking */}
      <section className="profile-section">
        <h3>College Linking</h3>
        
        {user?.collegeId ? (
          <div className="linked-card">
            <CheckCircle2 size={24} className="linked-icon" />
            <div className="linked-content">
              <h4>Linked to {user.collegeName}</h4>
              <p>Your invite code: <strong>{user.inviteCode}</strong></p>
            </div>
          </div>
        ) : (
          <div className="unlinked-card">
            <div className="unlinked-header">
              <AlertCircle size={20} className="unlinked-icon" />
              <h4>Your account is not linked to a college yet.</h4>
            </div>
            <p className="unlinked-desc">Enter your invite code below to unlock Gap Analysis and view company benchmarks set by your placement cell.</p>
            
            <div className="link-form">
              <input 
                type="text" 
                placeholder="e.g. SRN001" 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                disabled={isLinking}
              />
              <button onClick={handleLinkCollege} disabled={isLinking || !inviteCode}>
                {isLinking ? "Linking..." : "Link My College"}
              </button>
            </div>
            
            {linkError && <p className="link-error">{linkError}</p>}
            {linkSuccess && <p className="link-success">{linkSuccess}</p>}
          </div>
        )}
      </section>

      {/* 3. Diagnostic History */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Diagnostic History</h3>
        </div>
        
        {loadingHistory ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <div className="empty-history">
            <Clock size={32} />
            <p>No diagnostic tests taken yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Aptitude</th>
                  <th>DSA</th>
                  <th>Comm.</th>
                  <th>Overall</th>
                  <th>Trust Score</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>{new Date(h.attemptedAt).toLocaleDateString()}</td>
                    <td>{Math.round(h.aptitudeScore)}</td>
                    <td>{Math.round(h.dsaScore)}</td>
                    <td>{Math.round(h.communicationScore)}</td>
                    <td><strong>{Math.round(h.overallScore)}</strong></td>
                    <td>
                      <span className={`trust-badge trust-${h.trustScore === 100 ? 'high' : h.trustScore > 50 ? 'med' : 'low'}`}>
                        {h.trustScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};

export default ProfilePage;

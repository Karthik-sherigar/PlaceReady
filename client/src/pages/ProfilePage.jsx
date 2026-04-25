import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { linkCollege, updateProfile } from "../services/authService";
import { getDiagnosticHistory } from "../services/diagnosticService";
import { CheckCircle2, AlertCircle, Clock, X, Check } from "lucide-react";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, updateUserCollege, updateProfileData } = useAuth();
  
  const [inviteCode, setInviteCode] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    branch: user?.branch || "",
    targetRole: user?.targetRole || ""
  });
  const [isSaving, setIsSaving] = useState(false);
  
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

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await updateProfile(editData);
      updateProfileData({
        name: updatedUser.name,
        branch: updatedUser.branch,
        targetRole: updatedUser.targetRole
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile Settings</h2>

      {/* 1. Personal Information */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Personal Information</h3>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="edit-btn" onClick={() => setIsEditing(false)} style={{ background: "#f1f5f9", color: "var(--navy)" }} disabled={isSaving}>
                <X size={16} /> Cancel
              </button>
              <button className="edit-btn" onClick={handleSaveProfile} disabled={isSaving} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Check size={16} /> {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Full Name</span>
            {!isEditing ? <span className="info-value">{user?.name}</span> : (
              <input type="text" className="profile-input" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
            )}
          </div>
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value" style={{ color: "var(--text-muted)" }}>{user?.email} (Cannot be changed)</span>
          </div>
          <div className="info-item">
            <span className="info-label">Branch</span>
            {!isEditing ? <span className="info-value">{user?.branch || "Not specified"}</span> : (
              <input type="text" className="profile-input" value={editData.branch} onChange={e => setEditData({...editData, branch: e.target.value})} placeholder="e.g. Computer Science" />
            )}
          </div>
          <div className="info-item">
            <span className="info-label">Target Role</span>
            {!isEditing ? <span className="info-value">{user?.targetRole || "Not specified"}</span> : (
              <input type="text" className="profile-input" value={editData.targetRole} onChange={e => setEditData({...editData, targetRole: e.target.value})} placeholder="e.g. Frontend Developer" />
            )}
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

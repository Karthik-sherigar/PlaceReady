import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerAdmin as apiRegister } from "../../services/adminAuthService";

const AdminRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeName: "",
    collegeLocation: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Success state UI
  const [successData, setSuccessData] = useState(null);

  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.collegeName) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiRegister(formData);
      setSuccessData(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !successData) handleRegister();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(successData.inviteCode);
    alert("Invite code copied to clipboard!");
  };

  if (successData) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-glow" style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 60%)" }}></div>
          <div className="auth-card" style={{ maxWidth: "480px", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", background: "#ecfdf5", color: "var(--emerald)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            
            <h2 style={{ color: "var(--navy)", marginBottom: "8px" }}>College Registered!</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Welcome to Apex, {successData.collegeName}.
            </p>

            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "8px", border: "1px dashed #cbd5e1", marginBottom: "24px" }}>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 8px" }}>Your Invite Code:</p>
              <h1 style={{ letterSpacing: "4px", color: "var(--navy)", margin: "0 0 16px", fontSize: "36px" }}>{successData.inviteCode}</h1>
              <button 
                onClick={handleCopyCode}
                style={{ background: "#e2e8f0", color: "var(--navy)", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
              >
                Copy to Clipboard
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.5" }}>
              Share this code with your students so they can link to your college during registration. You can always view this code on your dashboard.
            </p>

            <button
              className="auth-btn"
              onClick={() => navigate("/admin/dashboard")}
              style={{ background: "var(--emerald)" }}
            >
              Go to Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-glow" style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 60%)" }}></div>
        <div className="auth-card" style={{ maxWidth: "480px" }}>
          <div className="auth-header">
            <h1 className="auth-logo">Apex Admin</h1>
            <p className="auth-subtitle">Register your college</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-form">
            <div className="input-group">
              <label htmlFor="admin-collegeName">College Name *</label>
              <input
                id="admin-collegeName"
                type="text"
                placeholder="e.g. Srinivas University"
                value={formData.collegeName}
                onChange={(e) => handleChange("collegeName", e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="input-group">
              <label htmlFor="admin-name">Admin Full Name *</label>
              <input
                id="admin-name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="input-group">
              <label htmlFor="admin-email">Admin Email *</label>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@college.edu"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="admin-password">Password *</label>
                <input
                  id="admin-password"
                  type="password"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="input-group">
                <label htmlFor="admin-confirm">Confirm Password *</label>
                <input
                  id="admin-confirm"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="admin-location">College Location</label>
              <input
                id="admin-location"
                type="text"
                placeholder="City, State"
                value={formData.collegeLocation}
                onChange={(e) => handleChange("collegeLocation", e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <button
              className="auth-btn"
              onClick={handleRegister}
              disabled={isLoading}
              style={{ background: "var(--emerald)" }}
            >
              {isLoading ? <span className="btn-spinner"></span> : "Register College"}
            </button>
          </div>

          <p className="auth-footer">
            Already have an account? <Link to="/admin/login" style={{ color: "var(--emerald)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterPage;

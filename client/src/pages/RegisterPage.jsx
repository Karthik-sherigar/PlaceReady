import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    branch: "",
    targetRole: "",
    inviteCode: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required");
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-glow"></div>
        <div className="auth-card" style={{ maxWidth: "480px" }}>
          <div className="auth-header">
            <h1 className="auth-logo">PlaceReady</h1>
            <p className="auth-subtitle">Create your student account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-form">
            <div className="input-group">
              <label htmlFor="register-name">Full Name</label>
              <input
                id="register-name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="register-branch">Branch</label>
                <input
                  id="register-branch"
                  type="text"
                  placeholder="e.g. CSE"
                  value={formData.branch}
                  onChange={(e) => handleChange("branch", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="input-group">
                <label htmlFor="register-role">Target Role</label>
                <input
                  id="register-role"
                  type="text"
                  placeholder="e.g. SDE"
                  value={formData.targetRole}
                  onChange={(e) => handleChange("targetRole", e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: "8px" }}>
              <label htmlFor="register-invite">College Invite Code (optional)</label>
              <input
                id="register-invite"
                type="text"
                placeholder="Enter code from your placement cell e.g. SRN001"
                value={formData.inviteCode}
                onChange={(e) => handleChange("inviteCode", e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
              />
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Don't have a code? You can still register and add it later.
              </p>
            </div>

            <button
              id="register-submit"
              className="auth-btn"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? <span className="btn-spinner"></span> : "Create Account"}
            </button>
          </div>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { loginAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);
    try {
      await loginAdmin(formData);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-glow" style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 60%)" }}></div>
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-logo">Apex Admin</h1>
            <p className="auth-subtitle">Log in to college portal</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-form">
            <div className="input-group">
              <label htmlFor="admin-email">College Email</label>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@college.edu"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label htmlFor="admin-password">Password</label>
              </div>
              <input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                onKeyDown={handleKeyDown}
              />
            </div>

            <button
              className="auth-btn"
              onClick={handleLogin}
              disabled={isLoading}
              style={{ background: "var(--emerald)" }}
            >
              {isLoading ? <span className="btn-spinner"></span> : "Sign In"}
            </button>
          </div>

          <p className="auth-footer">
            New college? <Link to="/admin/register" style={{ color: "var(--emerald)" }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

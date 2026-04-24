import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-glow"></div>
        <div className="dashboard-card">
          <div className="dashboard-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="dashboard-welcome">
            Welcome, <span>{user?.name}</span>
          </h1>
          <p className="dashboard-email">{user?.email}</p>

          <div className="dashboard-meta">
            {user?.branch && (
              <span className="meta-chip">
                <span className="meta-label">Branch</span>
                {user.branch}
              </span>
            )}
            {user?.targetRole && (
              <span className="meta-chip">
                <span className="meta-label">Goal</span>
                {user.targetRole}
              </span>
            )}
          </div>

          <button id="logout-btn" className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

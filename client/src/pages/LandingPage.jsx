import { useNavigate } from "react-router-dom";
import { GraduationCap, Building2 } from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-header">
          <h1 className="landing-logo">Apex</h1>
          <p className="landing-subtitle">Select your portal to continue</p>
        </div>

        <div className="role-cards">
          {/* Student Card */}
          <div className="role-card" onClick={() => navigate("/login")}>
            <div className="role-icon-wrapper student-icon">
              <GraduationCap size={40} />
            </div>
            <h2>Student Portal</h2>
            <p>Take diagnostic tests, view your roadmap, and practice mock interviews.</p>
            <div className="role-actions">
              <button className="role-btn primary-btn">Login</button>
              <button 
                className="role-btn secondary-btn" 
                onClick={(e) => { e.stopPropagation(); navigate("/register"); }}
              >
                Register
              </button>
            </div>
          </div>

          {/* Admin Card */}
          <div className="role-card" onClick={() => navigate("/admin/login")}>
            <div className="role-icon-wrapper admin-icon">
              <Building2 size={40} />
            </div>
            <h2>College Admin</h2>
            <p>Manage your college profile, track student progress, and add companies.</p>
            <div className="role-actions">
              <button className="role-btn primary-btn admin-theme">Login</button>
              <button 
                className="role-btn secondary-btn admin-theme" 
                onClick={(e) => { e.stopPropagation(); navigate("/admin/register"); }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

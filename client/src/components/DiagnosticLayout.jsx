import { Outlet, useLocation } from "react-router-dom";
import "../pages/DiagnosticTest.css";

const DiagnosticLayout = () => {
  const location = useLocation();
  
  let step = 1;
  if (location.pathname.includes("dsa")) step = 2;
  if (location.pathname.includes("communication")) step = 3;

  const progressPercentage = (step / 3) * 100;

  return (
    <div className="diagnostic-layout">
      <header className="diag-header">
        <div className="diag-brand">
          P<span>R</span>
        </div>
        <div className="diag-progress-container">
          <span className="diag-step-text">Step {step} of 3</span>
          <div className="diag-progress-bar">
            <div
              className="diag-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </header>

      <main className="diag-main">
        <Outlet />
      </main>
    </div>
  );
};

export default DiagnosticLayout;

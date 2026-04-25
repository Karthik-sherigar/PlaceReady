import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { proctorManager } from "../utils/ProctoringManager";
import { AlertCircle } from "lucide-react";
import { useDiagnostic } from "../context/DiagnosticContext";
import "../pages/DiagnosticTest.css";

const DiagnosticLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSetup = location.pathname.includes("setup");
  const isReport = location.pathname.includes("report");
  
  const videoRef = useRef(null);
  const [warning, setWarning] = useState(null);

  const { resetDiagnostic } = useDiagnostic();

  // Initialize Proctoring Manager
  useEffect(() => {
    if (isSetup || isReport) return; // Do not start proctoring on setup or report
    
    // Request webcam stream specifically for the hidden proctoring video
    const initHiddenStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to re-acquire proctoring webcam stream", err);
      }
    };
    initHiddenStream();

    const handleWarning = (violation, count, message) => {
      if (count >= 3) {
        // Auto-submit logic is handled in context or by forcing navigation,
        // but here we just show the final warning. The submission is triggered in context.
        setWarning({
          title: "Test Auto-Submitted",
          message: "Your test has been automatically submitted due to multiple violations.",
          count,
          isFinal: true
        });
      } else {
        setWarning({
          title: "⚠️ Violation Detected",
          message,
          count,
          isFinal: false
        });
      }
    };

    proctorManager.init(videoRef, handleWarning);
    proctorManager.start();

    return () => {
      proctorManager.stop();
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isSetup, isReport]);

  const handleReturnToTest = async () => {
    if (warning?.message.includes("fullscreen")) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        // Enforce an extra violation if they deny fullscreen reentry
        proctorManager.recordViolation("Fullscreen Refused", "Failed to re-enter fullscreen.");
      }
    }
    setWarning(null);
  };

  const handleReturnToDashboard = () => {
    proctorManager.stop();
    resetDiagnostic();
    setWarning(null);
    navigate("/dashboard");
  };

  let step = 1;
  if (location.pathname.includes("dsa")) step = 2;
  if (location.pathname.includes("communication")) step = 3;
  if (isSetup || isReport) step = 0;

  const progressPercentage = (step / 3) * 100;

  return (
    <div className="diagnostic-layout">
      {/* Hidden Proctoring Video */}
      {!isSetup && !isReport && (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ display: "none" }} 
        />
      )}

      {/* Warning Modal */}
      {warning && (
        <div className="eval-overlay warning-overlay">
          <div className="warning-modal">
            <AlertCircle size={48} color="#ef4444" />
            <h3>{warning.title}</h3>
            <p>{warning.message}</p>
            <span className="warning-count">Warning {warning.count} of 3</span>
            {!warning.isFinal && (
              <button className="nav-btn nav-btn--submit" onClick={handleReturnToTest}>
                Return to Test
              </button>
            )}
            {warning.isFinal && (
              <button className="nav-btn nav-btn--prev" onClick={handleReturnToDashboard} style={{ marginTop: "8px" }}>
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      )}

      {step > 0 && (
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
      )}

      <main className={`diag-main ${isSetup ? 'main-setup' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default DiagnosticLayout;

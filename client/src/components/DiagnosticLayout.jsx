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

  const { resetDiagnostic, webcamStream, startWebcam, stopWebcam } = useDiagnostic();

  // Initialize webcam stream and start proctoring
  useEffect(() => {
    if (isSetup || isReport) return;
    
    const handleWarning = (violation, count, message) => {
      if (count >= 3) {
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

    const initAll = async () => {
      // 1. Ensure we have a webcam stream
      let stream = webcamStream;
      if (!stream) {
        try {
          stream = await startWebcam();
        } catch (err) {
          console.error("Proctoring failed to acquire stream", err);
        }
      }

      // 2. Attach stream to hidden video element
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 2) {
            resolve();
          } else {
            videoRef.current.onloadeddata = resolve;
          }
        });
      }

      // 3. Start proctoring with the now-ready video ref
      proctorManager.init(videoRef, handleWarning);
      if (!proctorManager.isActive) {
        proctorManager.start();
      }
    };

    initAll();

    return () => {
      proctorManager.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSetup, isReport, webcamStream]);

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
    stopWebcam();
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

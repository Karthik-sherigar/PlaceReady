import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Mic, Maximize, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useDiagnostic } from "../context/DiagnosticContext";

const DiagnosticSetup = () => {
  const navigate = useNavigate();
  const { startWebcam, webcamStream, resetDiagnostic } = useDiagnostic();
  
  // Reset all previous test data when entering setup
  useEffect(() => {
    resetDiagnostic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const [camStatus, setCamStatus] = useState("checking"); // checking, ready, error
  const [micStatus, setMicStatus] = useState("checking");
  const [fsStatus, setFsStatus] = useState("checking");
  const [browserWarning, setBrowserWarning] = useState("");
  
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafIdRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // 1. Browser Check
  useEffect(() => {
    const ua = navigator.userAgent;
    if (!/Chrome|Edg/.test(ua) || /Firefox|Safari(?!.*Chrome)/.test(ua)) {
      setBrowserWarning("For the best experience, please use Google Chrome or Microsoft Edge.");
    }
  }, []);

  // 2. Fullscreen Check
  useEffect(() => {
    const checkFullscreen = () => {
      if (document.fullscreenElement) setFsStatus("ready");
      else setFsStatus("error");
    };
    document.addEventListener("fullscreenchange", checkFullscreen);
    checkFullscreen(); // initial check
    return () => document.removeEventListener("fullscreenchange", checkFullscreen);
  }, []);

  // 3. Camera & Mic Check
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await startWebcam();
        
        // Video
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCamStatus("ready");
        setMicStatus("ready");

        // Audio Level Analyzer
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        const updateLevel = () => {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArrayRef.current[i];
          }
          const average = sum / bufferLength;
          setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
          rafIdRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();

      } catch (err) {
        if (err.name === "NotAllowedError" || err.name === "NotFoundError") {
          setCamStatus("error");
          setMicStatus("error");
        }
      }
    };
    
    initMedia();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, [startWebcam]);

  const handleEnterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Fullscreen failed:", err);
    }
  };

  const allReady = camStatus === "ready" && micStatus === "ready" && fsStatus === "ready";

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h2>System Check</h2>
        <p className="setup-subtitle">Before starting the test, we need to verify your environment.</p>

        {browserWarning && (
          <div className="setup-warning">
            <AlertCircle size={16} />
            {browserWarning}
          </div>
        )}

        <div className="check-list">
          {/* Camera */}
          <div className="check-item">
            <div className="check-icon"><Camera size={20} /></div>
            <div className="check-body">
              <div className="check-header">
                <span className="check-title">Webcam</span>
                {camStatus === "checking" && <Loader2 className="check-spinner" size={16} />}
                {camStatus === "ready" && <CheckCircle2 className="check-pass" size={16} />}
                {camStatus === "error" && <AlertCircle className="check-fail" size={16} />}
              </div>
              {camStatus === "ready" && (
                <div className="video-preview">
                  <video ref={videoRef} autoPlay playsInline muted></video>
                </div>
              )}
              {camStatus === "error" && (
                <p className="check-help">Click the lock icon in your browser address bar and allow camera access.</p>
              )}
            </div>
          </div>

          {/* Microphone */}
          <div className="check-item">
            <div className="check-icon"><Mic size={20} /></div>
            <div className="check-body">
              <div className="check-header">
                <span className="check-title">Microphone</span>
                {micStatus === "checking" && <Loader2 className="check-spinner" size={16} />}
                {micStatus === "ready" && <CheckCircle2 className="check-pass" size={16} />}
                {micStatus === "error" && <AlertCircle className="check-fail" size={16} />}
              </div>
              {micStatus === "ready" && (
                <div className="audio-level-container">
                  <div className="audio-level-bar" style={{ width: `${audioLevel}%` }}></div>
                </div>
              )}
              {micStatus === "error" && (
                <p className="check-help">Allow microphone access in your browser settings.</p>
              )}
            </div>
          </div>

          {/* Fullscreen */}
          <div className="check-item">
            <div className="check-icon"><Maximize size={20} /></div>
            <div className="check-body">
              <div className="check-header">
                <span className="check-title">Fullscreen Mode</span>
                {fsStatus === "checking" && <Loader2 className="check-spinner" size={16} />}
                {fsStatus === "ready" && <CheckCircle2 className="check-pass" size={16} />}
                {fsStatus === "error" && <AlertCircle className="check-fail" size={16} />}
              </div>
              {fsStatus === "error" && (
                <>
                  <p className="check-help">Click the button below to enter fullscreen.</p>
                  <button className="fs-btn" onClick={handleEnterFullscreen}>Enter Fullscreen</button>
                </>
              )}
            </div>
          </div>
        </div>

        <button 
          className="start-test-btn" 
          disabled={!allReady}
          onClick={() => navigate("/diagnostic/aptitude")}
        >
          Start Diagnostic Test
        </button>
      </div>
    </div>
  );
};

export default DiagnosticSetup;

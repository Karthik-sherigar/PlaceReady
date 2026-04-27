import { createContext, useContext, useState, useEffect, useRef } from "react";

const DiagnosticContext = createContext(null);

export const useDiagnostic = () => {
  const context = useContext(DiagnosticContext);
  if (!context) {
    throw new Error("useDiagnostic must be used within a DiagnosticProvider");
  }
  return context;
};

export const DiagnosticProvider = ({ children }) => {
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});
  const [dsaAnswers, setDsaAnswers] = useState({});
  const [communicationAnswers, setCommunicationAnswers] = useState({});
  const [webcamStream, setWebcamStream] = useState(null);
  
  // Timers in seconds
  const [aptitudeTimeLeft, setAptitudeTimeLeft] = useState(15 * 60);
  const [dsaTimeLeft, setDsaTimeLeft] = useState(20 * 60);
  const [communicationTimeLeft, setCommunicationTimeLeft] = useState(10 * 60);
  
  const [activeSection, setActiveSection] = useState(null); // 'aptitude' | 'dsa' | 'communication'

  // Timer Ref to hold the interval
  const timerRef = useRef(null);

  // Auto-save helpers
  const updateAptitudeAnswer = (questionId, answer) => {
    setAptitudeAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const updateDsaAnswer = (questionId, answer) => {
    setDsaAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const updateCommunicationAnswer = (questionId, answer) => {
    setCommunicationAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Timer Management
  useEffect(() => {
    if (!activeSection) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (activeSection === "aptitude") {
        setAptitudeTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (activeSection === "dsa") {
        setDsaTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (activeSection === "communication") {
        setCommunicationTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [activeSection]);

  const resetDiagnostic = () => {
    setAptitudeAnswers({});
    setDsaAnswers({});
    setCommunicationAnswers({});
    setAptitudeTimeLeft(15 * 60);
    setDsaTimeLeft(20 * 60);
    setCommunicationTimeLeft(10 * 60);
    setActiveSection(null);
  };

  const startWebcam = async () => {
    if (webcamStream) return webcamStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setWebcamStream(stream);
      return stream;
    } catch (err) {
      console.error("Webcam access failed:", err);
      throw err;
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
  };

  const value = {
    aptitudeAnswers,
    updateAptitudeAnswer,
    dsaAnswers,
    updateDsaAnswer,
    communicationAnswers,
    updateCommunicationAnswer,
    aptitudeTimeLeft,
    dsaTimeLeft,
    communicationTimeLeft,
    setActiveSection,
    resetDiagnostic,
    webcamStream,
    startWebcam,
    stopWebcam,
  };

  return (
    <DiagnosticContext.Provider value={value}>
      {children}
    </DiagnosticContext.Provider>
  );
};

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDiagnostic } from "../context/DiagnosticContext";
import { getDiagnosticQuestions, submitDiagnostic, submitProctoringReport } from "../services/diagnosticService";
import { Timer, Mic, Square, RotateCcw, AlertTriangle } from "lucide-react";
import { proctorManager } from "../utils/ProctoringManager";

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const MIN_WORDS = 30;

const DiagnosticCommunication = () => {
  const {
    communicationAnswers,
    updateCommunicationAnswer,
    communicationTimeLeft,
    setActiveSection,
    aptitudeAnswers,
    dsaAnswers,
  } = useDiagnostic();

  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Speech Recognition States
  const [isSupported, setIsSupported] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    setActiveSection("communication");
    const fetchQ = async () => {
      try {
        const data = await getDiagnosticQuestions();
        setQuestions(data.communication || []);
      } catch (err) {
        console.error("Failed to fetch comm questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQ();

    // Check Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript((prev) => prev + finalTranscript + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== "no-speech") {
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        // If it was supposed to be recording but stopped (e.g. timeout), restart it
        if (isRecording) {
            // we will let the user manage start/stop to avoid loops
            setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [setActiveSection]);

  // Load existing transcript when question changes
  useEffect(() => {
    if (questions.length > 0) {
      const currentQId = questions[currentIndex]._id;
      setTranscript(communicationAnswers[currentQId] || "");
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    }
  }, [currentIndex, questions, communicationAnswers]);

  // Auto-submit if time runs out
  useEffect(() => {
    if (communicationTimeLeft === 0 && questions.length > 0) {
      handleSubmitAll();
    }
  }, [communicationTimeLeft, questions.length]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // Save current transcript
      const currentQ = questions[currentIndex];
      updateCommunicationAnswer(currentQ._id, transcript);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      // Clear transcript if starting fresh
      if (!transcript) {
        setTranscript("");
      }
    }
  };

  const handleRerecord = () => {
    setTranscript("");
    const currentQ = questions[currentIndex];
    updateCommunicationAnswer(currentQ._id, "");
  };

  const handleNext = () => {
    if (isRecording) toggleRecording();
    const currentQ = questions[currentIndex];
    updateCommunicationAnswer(currentQ._id, transcript);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isRecording) toggleRecording();
    const currentQ = questions[currentIndex];
    updateCommunicationAnswer(currentQ._id, transcript);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmitAll = async () => {
    if (isRecording) toggleRecording();
    if (questions.length > 0) {
      const currentQ = questions[currentIndex];
      updateCommunicationAnswer(currentQ._id, transcript);
    }

    setIsSubmitting(true);
    setActiveSection(null); // stop timers
    proctorManager.stop();
    try {
      const diagResponse = await submitDiagnostic({
        aptitudeAnswers,
        dsaAnswers,
        communicationAnswers,
      });
      
      const diagId = diagResponse.diagnosticResultId;

      const proctorPayload = proctorManager.getReportPayload(diagId, false);
      await submitProctoringReport(proctorPayload);

      // Redirect to report
      navigate("/diagnostic/report");
    } catch (error) {
      console.error("Failed to submit diagnostic/proctoring", error);
      setIsSubmitting(false);
      alert("Failed to submit. Please try again.");
    }
  };

  if (loading) return <div>Loading communication questions...</div>;
  if (!questions || questions.length === 0) return <div>No communication questions found.</div>;

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const wordCount = transcript.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const strictCanProceed = wordCount >= MIN_WORDS;

  proctorManager.setCurrentContext("Communication", currentIndex + 1);

  return (
    <>
      {isSubmitting && (
        <div className="eval-overlay">
          <div className="eval-spinner"></div>
          <div className="eval-text">Calculating your results...</div>
          <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>
            Please wait while our AI evaluates your responses.
          </p>
        </div>
      )}

      <div className="test-container">
        {!isSupported && (
          <div className="setup-warning" style={{ color: "#b91c1c", borderColor: "#fecaca", background: "#fef2f2", marginBottom: "16px" }}>
            <AlertTriangle size={18} />
            Voice input requires Google Chrome or Microsoft Edge. Please switch browsers or your answer cannot be recorded.
          </div>
        )}

        <div className="test-header">
          <div className="test-title-area">
            <h2>Communication Section</h2>
            <span className="test-instruction">
              Speak clearly into your microphone. Minimum 30 words required per answer.
            </span>
          </div>
          <div className={`test-timer ${communicationTimeLeft < 60 ? "timer-warning" : ""}`}>
            <Timer size={20} />
            {formatTime(communicationTimeLeft)}
          </div>
        </div>

        <div className="question-card">
          <div className="question-meta">Question {currentIndex + 1} of {questions.length}</div>
          <div className="question-text">{currentQ.prompt}</div>

          <div className="voice-recorder-area">
            {/* Mic Button */}
            {!isRecording && transcript.length >= 5 ? (
              <button className="mic-btn mic-btn--done" disabled>
                <Mic size={32} />
                <span>Answer Recorded</span>
              </button>
            ) : (
              <button 
                className={`mic-btn ${isRecording ? "mic-btn--recording" : "mic-btn--idle"}`} 
                onClick={toggleRecording}
                disabled={!isSupported}
              >
                {isRecording ? <Square size={32} /> : <Mic size={32} />}
                <span>{isRecording ? "Listening..." : "Click to Start Speaking"}</span>
              </button>
            )}

            {/* Animation / Waveform placeholder */}
            {isRecording && (
              <div className="waveform-container">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            )}

            {/* Re-record option */}
            {!isRecording && transcript.length >= 5 && (
              <button className="rerecord-btn" onClick={handleRerecord}>
                <RotateCcw size={16} /> Re-record
              </button>
            )}

            {/* Live Transcription Box */}
            <div className="transcription-box">
              <p>{transcript || "Your transcribed answer will appear here..."}</p>
            </div>
            
            <span className={`char-count ${!strictCanProceed ? "invalid" : ""}`}>
              {wordCount} / {MIN_WORDS} words minimum
            </span>
          </div>
        </div>

        <div className="test-actions">
          <button className="nav-btn nav-btn--prev" onClick={handlePrev} disabled={currentIndex === 0}>
            Previous
          </button>
          
          {isLastQuestion ? (
            <button className="nav-btn nav-btn--submit" onClick={handleSubmitAll} disabled={!strictCanProceed}>
              Submit Final Test
            </button>
          ) : (
            <button className="nav-btn nav-btn--next" onClick={handleNext} disabled={!strictCanProceed}>
              Next Question
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default DiagnosticCommunication;

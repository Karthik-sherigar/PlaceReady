import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDiagnostic } from "../context/DiagnosticContext";
import { getDiagnosticQuestions, submitDiagnostic, submitProctoringReport } from "../services/diagnosticService";
import { Timer } from "lucide-react";
import { proctorManager } from "../utils/ProctoringManager";
import LiveCameraPreview from "../components/LiveCameraPreview";

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
  // Initialize answer from context when questions load
  const [answer, setAnswer] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Set initial answer once questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !initialized) {
      setAnswer(communicationAnswers[questions[0]._id] || "");
      setInitialized(true);
    }
  }, [questions, initialized, communicationAnswers]);

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
  }, [setActiveSection]);

  // Auto-submit if time runs out
  useEffect(() => {
    if (communicationTimeLeft === 0 && questions.length > 0) {
      handleSubmitAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communicationTimeLeft, questions.length]);

  // Save current answer and navigate
  const saveAndGo = (nextIndex) => {
    if (questions.length > 0) {
      updateCommunicationAnswer(questions[currentIndex]._id, answer);
    }
    // Load the next question's saved answer (or blank)
    const savedAnswer = communicationAnswers[questions[nextIndex]._id] || "";
    setAnswer(savedAnswer);
    setCurrentIndex(nextIndex);
  };

  const handleNext = () => saveAndGo(currentIndex + 1);
  const handlePrev = () => saveAndGo(currentIndex - 1);

  const handleSubmitAll = async () => {
    if (questions.length > 0) {
      const currentQ = questions[currentIndex];
      updateCommunicationAnswer(currentQ._id, answer);
    }

    setIsSubmitting(true);
    setActiveSection(null); // stop timers
    proctorManager.stop();
    try {
      // Small delay to ensure state updates propagate
      const currentAnswers = { ...communicationAnswers };
      if (questions.length > 0) {
        currentAnswers[questions[currentIndex]._id] = answer;
      }

      const diagResponse = await submitDiagnostic({
        aptitudeAnswers,
        dsaAnswers,
        communicationAnswers: currentAnswers,
      });
      
      const diagId = diagResponse.diagnosticResultId;
      const proctorPayload = proctorManager.getReportPayload(diagId, false);
      await submitProctoringReport(proctorPayload);

      navigate("/diagnostic/report");
    } catch (error) {
      console.error("Failed to submit diagnostic/proctoring", error);
      setIsSubmitting(false);
      alert("Failed to submit. Please try again.");
    }
  };

  if (loading) return <div className="auth-loading"><div className="spinner"></div></div>;
  if (!questions || questions.length === 0) return <div>No communication questions found.</div>;

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const wordCount = answer.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const canProceed = wordCount >= MIN_WORDS;

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
        <div className="test-header">
          <div className="test-title-area">
            <h2>Communication Section</h2>
            <span className="test-instruction">
              Type your response clearly. Minimum 30 words required.
            </span>
          </div>
          <div className={`test-timer ${communicationTimeLeft < 60 ? "timer-warning" : ""}`}>
            <Timer size={20} />
            {formatTime(communicationTimeLeft)}
          </div>
        </div>

        <div className="question-card">
          <div className="question-meta">Question {currentIndex + 1} of {questions.length}</div>
          <div className="question-text" style={{ fontSize: "1.2rem", color: "var(--navy)", marginBottom: "2rem" }}>
            {currentQ.prompt}
          </div>

          <div className="writing-area">
            <textarea
              key={currentIndex}
              className="comm-textarea"
              placeholder="Start typing your response here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              spellCheck="true"
              autoFocus
            />
            
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <span className={`char-count ${!canProceed ? "invalid" : ""}`} style={{ fontWeight: "600" }}>
                {wordCount} / {MIN_WORDS} words minimum
              </span>
            </div>
          </div>
        </div>

        <div className="test-actions">
          <button className="nav-btn nav-btn--prev" onClick={handlePrev} disabled={currentIndex === 0}>
            Previous
          </button>
          
          {isLastQuestion ? (
            <button className="nav-btn nav-btn--submit" onClick={handleSubmitAll} disabled={!canProceed}>
              Submit Final Test
            </button>
          ) : (
            <button className="nav-btn nav-btn--next" onClick={handleNext} disabled={!canProceed}>
              Next Question
            </button>
          )}
        </div>
        
        <LiveCameraPreview />
      </div>
    </>
  );
};

export default DiagnosticCommunication;

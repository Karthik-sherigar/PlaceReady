import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDiagnostic } from "../context/DiagnosticContext";
import { getDiagnosticQuestions, submitDiagnostic } from "../services/diagnosticService";
import { Timer } from "lucide-react";

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const MIN_CHARS = 50;

const DiagnosticCommunication = () => {
  const navigate = useNavigate();
  const {
    aptitudeAnswers,
    dsaAnswers,
    communicationAnswers,
    updateCommunicationAnswer,
    communicationTimeLeft,
    setActiveSection,
  } = useDiagnostic();

  const [prompts, setPrompts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getDiagnosticQuestions();
        setPrompts(data.communication);
      } catch (error) {
        console.error("Failed to fetch questions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
    setActiveSection("communication");

    return () => setActiveSection(null);
  }, [setActiveSection]);

  // Auto-submit when time is up
  useEffect(() => {
    if (communicationTimeLeft === 0 && prompts.length > 0 && !isSubmitting) {
      handleSubmitAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communicationTimeLeft, prompts.length, isSubmitting]);

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    setActiveSection(null); // stop timers
    try {
      await submitDiagnostic({
        aptitudeAnswers,
        dsaAnswers,
        communicationAnswers,
      });
      // Redirect to gap analysis
      navigate("/gap-analysis");
    } catch (error) {
      console.error("Failed to submit diagnostic", error);
      setIsSubmitting(false);
      alert("Failed to submit. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="auth-loading"><div className="spinner"></div></div>;
  }

  if (prompts.length === 0) return <div>No prompts found.</div>;

  const currentPrompt = prompts[currentIndex];
  const isLastQuestion = currentIndex === prompts.length - 1;
  const currentAnswer = communicationAnswers[currentPrompt.id] || "";
  const chars = currentAnswer.trim().length;
  const isInvalid = chars > 0 && chars < MIN_CHARS;
  const canProceed = chars === 0 || chars >= MIN_CHARS; // allowing skip for now if 0, or strictly force? Requirements: "Minimum 50 characters before allowing Next".
  const disableNext = chars > 0 && chars < MIN_CHARS; // If they started typing, force 50 chars. If empty, technically they can skip, but let's enforce 50 if they type.
  // Wait, requirement says "Minimum 50 characters before allowing Next". I'll strictly enforce it.
  const strictCanProceed = chars >= MIN_CHARS;

  return (
    <>
      {isSubmitting && (
        <div className="eval-overlay">
          <div className="eval-spinner"></div>
          <p className="eval-text">Calculating your results...</p>
        </div>
      )}

      <div className="test-container">
        <div className="test-header">
          <div className="test-title-area">
            <h2>Communication Skills</h2>
            <p className="test-instruction">Type your response to the prompt below.</p>
          </div>
          <div className={`test-timer ${communicationTimeLeft <= 60 ? "timer-warning" : ""}`}>
            <Timer size={20} />
            <span>{formatTime(communicationTimeLeft)}</span>
          </div>
        </div>

        <div className="question-card">
          <div className="question-meta">
            Prompt {currentIndex + 1} of {prompts.length}
          </div>
          <p className="question-text">{currentPrompt.prompt}</p>

          <textarea
            className="comm-textarea"
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={(e) => updateCommunicationAnswer(currentPrompt.id, e.target.value)}
          ></textarea>
          
          <span className={`char-count ${isInvalid ? "invalid" : ""}`}>
            {chars} / {MIN_CHARS} characters minimum
          </span>
        </div>

        <div className="test-actions">
          <button
            className="nav-btn nav-btn--prev"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
          >
            Previous
          </button>

          {!isLastQuestion ? (
            <button
              className="nav-btn nav-btn--next"
              disabled={!strictCanProceed}
              onClick={() => setCurrentIndex((prev) => prev + 1)}
            >
              Next
            </button>
          ) : (
            <button
              className="nav-btn nav-btn--submit"
              disabled={!strictCanProceed}
              onClick={handleSubmitAll}
            >
              Submit Section & Finish Test
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default DiagnosticCommunication;

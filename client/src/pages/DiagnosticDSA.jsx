import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDiagnostic } from "../context/DiagnosticContext";
import { getDiagnosticQuestions } from "../services/diagnosticService";
import { Timer } from "lucide-react";

// Helper to format time "MM:SS"
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const DiagnosticDSA = () => {
  const navigate = useNavigate();
  const {
    dsaAnswers,
    updateDsaAnswer,
    dsaTimeLeft,
    setActiveSection,
  } = useDiagnostic();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getDiagnosticQuestions();
        setQuestions(data.dsa);
      } catch (error) {
        console.error("Failed to fetch questions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
    setActiveSection("dsa");

    return () => setActiveSection(null);
  }, [setActiveSection]);

  // Auto-submit when time is up
  useEffect(() => {
    if (dsaTimeLeft === 0 && questions.length > 0) {
      handleNextSection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dsaTimeLeft, questions.length]);

  const handleNextSection = () => {
    navigate("/diagnostic/communication");
  };

  if (isLoading) {
    return <div className="auth-loading"><div className="spinner"></div></div>;
  }

  if (questions.length === 0) return <div>No questions found.</div>;

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="test-container">
      <div className="test-header">
        <div className="test-title-area">
          <h2>Data Structures & Algorithms</h2>
          <p className="test-instruction">Select the best answer for each question.</p>
        </div>
        <div className={`test-timer ${dsaTimeLeft <= 60 ? "timer-warning" : ""}`}>
          <Timer size={20} />
          <span>{formatTime(dsaTimeLeft)}</span>
        </div>
      </div>

      <div className="question-card">
        <div className="question-meta">
          Question {currentIndex + 1} of {questions.length}
        </div>
        <p className="question-text">{currentQ.question}</p>

        <div className="options-list">
          {Object.entries(currentQ.options).map(([key, value]) => {
            const isSelected = dsaAnswers[currentQ.id] === key;
            return (
              <div
                key={key}
                className={`option-card ${isSelected ? "selected" : ""}`}
                onClick={() => updateDsaAnswer(currentQ.id, key)}
              >
                <span className="option-letter">{key}</span>
                <span className="option-text">{value}</span>
              </div>
            );
          })}
        </div>
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
            onClick={() => setCurrentIndex((prev) => prev + 1)}
          >
            Next
          </button>
        ) : (
          <button
            className="nav-btn nav-btn--submit"
            onClick={handleNextSection}
          >
            Continue to Communication
          </button>
        )}
      </div>
    </div>
  );
};

export default DiagnosticDSA;

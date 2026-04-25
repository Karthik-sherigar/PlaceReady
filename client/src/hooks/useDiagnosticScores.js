import { useState, useEffect } from "react";
import { getLatestScore } from "../services/diagnosticService";

const useDiagnosticScores = () => {
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const data = await getLatestScore();
        setScores(data);
      } catch (err) {
        // 404 means no score yet, which is a valid state
        if (err.response?.status !== 404) {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  return { scores, loading, error };
};

export default useDiagnosticScores;

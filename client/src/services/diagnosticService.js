import axios from "axios";

const API_URL = "/api/diagnostic";

// Get questions
export const getDiagnosticQuestions = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/questions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Submit diagnostic answers
export const submitDiagnostic = async (answers) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/submit`, answers, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get latest score
export const getLatestScore = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/latest`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get diagnostic history
export const getDiagnosticHistory = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Submit proctoring report
export const submitProctoringReport = async (reportData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`/api/proctor/report`, reportData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get proctoring report
export const getProctoringReport = async (diagnosticResultId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`/api/proctor/report/${diagnosticResultId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

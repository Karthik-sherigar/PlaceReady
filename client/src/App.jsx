import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardOverview from "./pages/DashboardOverview";
import DiagnosticPage from "./pages/DiagnosticPage";
import GapAnalysisPage from "./pages/GapAnalysisPage";
import RoadmapPage from "./pages/RoadmapPage";
import MockInterviewPage from "./pages/MockInterviewPage";
import ProgressPage from "./pages/ProgressPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected dashboard routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            <Route path="/gap-analysis" element={<GapAnalysisPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/mock-interview" element={<MockInterviewPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

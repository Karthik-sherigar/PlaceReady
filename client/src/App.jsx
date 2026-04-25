import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DiagnosticProvider } from "./context/DiagnosticContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import DiagnosticLayout from "./components/DiagnosticLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardOverview from "./pages/DashboardOverview";
import DiagnosticAptitude from "./pages/DiagnosticAptitude";
import DiagnosticDSA from "./pages/DiagnosticDSA";
import DiagnosticCommunication from "./pages/DiagnosticCommunication";
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

          {/* Diagnostic Test routes (no sidebar, with Context) */}
          <Route
            path="/diagnostic"
            element={
              <ProtectedRoute>
                <DiagnosticProvider>
                  <DiagnosticLayout />
                </DiagnosticProvider>
              </ProtectedRoute>
            }
          >
            {/* Redirect /diagnostic to aptitude by default */}
            <Route index element={<Navigate to="aptitude" replace />} />
            <Route path="aptitude" element={<DiagnosticAptitude />} />
            <Route path="dsa" element={<DiagnosticDSA />} />
            <Route path="communication" element={<DiagnosticCommunication />} />
          </Route>

          {/* Protected dashboard routes (with sidebar) */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardOverview />} />
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

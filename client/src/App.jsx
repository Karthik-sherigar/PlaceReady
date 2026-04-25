import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DiagnosticProvider } from "./context/DiagnosticContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import DiagnosticLayout from "./components/DiagnosticLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardOverview from "./pages/DashboardOverview";
import DiagnosticSetup from "./pages/DiagnosticSetup";
import DiagnosticAptitude from "./pages/DiagnosticAptitude";
import DiagnosticDSA from "./pages/DiagnosticDSA";
import DiagnosticCommunication from "./pages/DiagnosticCommunication";
import DiagnosticReport from "./pages/DiagnosticReport";
import GapAnalysisPage from "./pages/GapAnalysisPage";
import RoadmapPage from "./pages/RoadmapPage";
import MockInterviewPage from "./pages/MockInterviewPage";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";
import StudentCompanies from "./pages/StudentCompanies";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminReports from "./pages/admin/AdminReports";

import LandingPage from "./pages/LandingPage";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Public routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />

            {/* Admin Protected routes */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

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
              {/* Redirect /diagnostic to setup by default */}
              <Route index element={<Navigate to="setup" replace />} />
              <Route path="setup" element={<DiagnosticSetup />} />
              <Route path="aptitude" element={<DiagnosticAptitude />} />
              <Route path="dsa" element={<DiagnosticDSA />} />
              <Route path="communication" element={<DiagnosticCommunication />} />
              <Route path="report" element={<DiagnosticReport />} />
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
              <Route path="/companies" element={<StudentCompanies />} />
              <Route path="/mock-interview" element={<MockInterviewPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;

import { useState, useEffect } from "react";
import axios from "axios";
import "./AdminStudents.css";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch students. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score === null || score === undefined) return "score-none";
    if (score >= 75) return "score-high";
    if (score >= 50) return "score-medium";
    return "score-low";
  };

  if (loading) {
    return <div className="admin-students-page">Loading students...</div>;
  }

  if (error) {
    return <div className="admin-students-page error">{error}</div>;
  }

  return (
    <div className="admin-students-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Registered Students</h1>
        <p className="admin-page-subtitle">View and manage students linked to your college.</p>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Target Role</th>
              <th>Diagnostic Score</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  No students have registered using your invite code yet.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  <td style={{ fontWeight: "500", color: "var(--navy)" }}>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.branch || "-"}</td>
                  <td>{student.targetRole || "-"}</td>
                  <td>
                    {student.hasDiagnostic ? (
                      <span className={`score-badge ${getScoreBadgeClass(student.diagnosticScore)}`}>
                        {student.diagnosticScore}%
                      </span>
                    ) : (
                      <span className="score-badge score-none">Not Taken</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStudents;

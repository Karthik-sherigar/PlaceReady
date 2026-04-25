import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import "./AdminReports.css";

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("/api/admin/stats/reports", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-reports-page">Loading reports...</div>;
  }

  if (error) {
    return <div className="admin-reports-page error">{error}</div>;
  }

  if (!reportData) return null;

  const radarData = [
    { subject: 'Aptitude', A: reportData.averageScores.aptitude, fullMark: 100 },
    { subject: 'DSA', A: reportData.averageScores.dsa, fullMark: 100 },
    { subject: 'Communication', A: reportData.averageScores.communication, fullMark: 100 },
  ];

  return (
    <div className="admin-reports-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">College Analytics</h1>
        <p className="admin-page-subtitle">View aggregate performance and placement readiness.</p>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>Average Diagnostic Scores</h3>
          <div className="chart-container" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="College Average" dataKey="A" stroke="var(--emerald)" fill="var(--emerald)" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-card">
          <h3>Readiness by Branch</h3>
          <div className="chart-container" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.branchData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="averageScore" name="Avg Score (%)" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;

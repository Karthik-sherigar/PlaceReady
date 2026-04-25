import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { getAdminStats } from "../../services/adminDataService";
import { Users, Building2, ClipboardCheck, Copy } from "lucide-react";

const AdminDashboard = () => {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(admin?.inviteCode || "");
    alert("Invite code copied to clipboard!");
  };

  return (
    <div className="admin-dashboard" style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ color: "var(--navy)", fontSize: "28px", margin: "0 0 8px 0" }}>
          Welcome, {admin?.collegeName}
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          Manage your students and companies from your placement portal.
        </p>
      </div>

      <div style={{ 
        background: "#fff", 
        border: "1px solid var(--border-light)", 
        borderRadius: "8px", 
        padding: "24px",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div>
          <h3 style={{ margin: "0 0 8px 0", color: "var(--navy)", fontSize: "18px" }}>Your College Invite Code</h3>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>
            Share this with students to link them to your college.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ 
            background: "#ecfdf5", 
            color: "var(--emerald)", 
            padding: "10px 24px", 
            borderRadius: "6px",
            fontSize: "24px",
            fontWeight: "bold",
            letterSpacing: "2px",
            border: "1px solid #a7f3d0"
          }}>
            {admin?.inviteCode}
          </div>
          <button 
            onClick={handleCopyCode}
            style={{ 
              background: "var(--navy)", 
              color: "#fff", 
              border: "none", 
              padding: "12px", 
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Copy Code"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ background: "#eff6ff", color: "#3b82f6", padding: "16px", borderRadius: "12px" }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ margin: "0 0 4px 0", color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textTransform: "uppercase" }}>Linked Students</p>
            <h2 style={{ margin: 0, color: "var(--navy)", fontSize: "32px" }}>
              {loading ? "..." : stats?.totalStudents || 0}
            </h2>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ background: "#fef3c7", color: "#d97706", padding: "16px", borderRadius: "12px" }}>
            <Building2 size={28} />
          </div>
          <div>
            <p style={{ margin: "0 0 4px 0", color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textTransform: "uppercase" }}>Total Companies</p>
            <h2 style={{ margin: 0, color: "var(--navy)", fontSize: "32px" }}>
              {loading ? "..." : stats?.totalCompanies || 0}
            </h2>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ background: "#ecfdf5", color: "var(--emerald)", padding: "16px", borderRadius: "12px" }}>
            <ClipboardCheck size={28} />
          </div>
          <div>
            <p style={{ margin: "0 0 4px 0", color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textTransform: "uppercase" }}>Completed Diagnostics</p>
            <h2 style={{ margin: 0, color: "var(--navy)", fontSize: "32px" }}>
              {loading ? "..." : stats?.completedDiagnostic || 0}
            </h2>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ margin: "0 0 16px 0", color: "var(--navy)", fontSize: "18px" }}>Recent Activity</h3>
        <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-muted)" }}>
          <p>No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

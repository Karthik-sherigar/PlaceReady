import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/companies", label: "Companies", icon: Building2 },
  { path: "/admin/students", label: "Students", icon: Users },
  { path: "/admin/reports", label: "Reports", icon: FileText },
];

const pageTitles = {
  "/admin/dashboard": "Admin Dashboard",
  "/admin/companies": "Manage Companies",
  "/admin/students": "Manage Students",
  "/admin/reports": "Reports",
};

const AdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { admin, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || "Admin Portal";
  const initials = admin?.collegeName
    ? admin.collegeName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  const closeMobileDrawer = () => setDrawerOpen(false);

  return (
    <div className="dash-layout">
      {/* ── Desktop Sidebar ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <span className="brand-icon">PR</span>
            <span className="brand-text">PlaceReady</span>
          </div>
          <div style={{ padding: "0 24px", marginBottom: "20px", fontSize: "12px", color: "var(--emerald)", textTransform: "uppercase", fontWeight: "bold" }}>
            Admin Portal
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link--active" : ""}`
                }
              >
                <item.icon size={20} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name" title={admin?.name}>{admin?.name || "Admin"}</span>
              <span className="user-email" title={admin?.collegeName}>{admin?.collegeName || ""}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Overlay ── */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={closeMobileDrawer}></div>
      )}

      {/* ── Mobile Drawer ── */}
      <aside className={`mobile-drawer ${drawerOpen ? "mobile-drawer--open" : ""}`}>
        <div className="drawer-header">
          <div className="sidebar-brand">
            <span className="brand-icon">PR</span>
            <span className="brand-text">PlaceReady</span>
          </div>
          <button className="drawer-close" onClick={closeMobileDrawer}>
            <X size={22} />
          </button>
        </div>
        <div style={{ padding: "0 24px", marginBottom: "20px", fontSize: "12px", color: "var(--emerald)", textTransform: "uppercase", fontWeight: "bold" }}>
            Admin Portal
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link--active" : ""}`
              }
              onClick={closeMobileDrawer}
            >
              <item.icon size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{admin?.name || "Admin"}</span>
              <span className="user-email">{admin?.collegeName || ""}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="dash-main">
        {/* Top header bar */}
        <header className="dash-topbar">
          <div className="topbar-left">
            <button
              className="hamburger-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="topbar-title">{pageTitle}</h1>
          </div>

          <div className="topbar-right">
            <span className="topbar-user-name">{admin?.collegeName || "College Admin"}</span>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="dash-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

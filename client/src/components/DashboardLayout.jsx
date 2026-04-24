import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Map,
  Mic,
  TrendingUp,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/diagnostic", label: "Diagnostic Test", icon: ClipboardList },
  { path: "/gap-analysis", label: "Gap Analysis", icon: BarChart3 },
  { path: "/roadmap", label: "Roadmap", icon: Map },
  { path: "/mock-interview", label: "Mock Interview", icon: Mic },
  { path: "/progress", label: "Progress Tracker", icon: TrendingUp },
];

const pageTitles = {
  "/dashboard": "Dashboard Overview",
  "/diagnostic": "Diagnostic Test",
  "/gap-analysis": "Gap Analysis",
  "/roadmap": "Roadmap",
  "/mock-interview": "Mock Interview",
  "/progress": "Progress Tracker",
};

const DashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || "PlaceReady";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileDrawer = () => setDrawerOpen(false);

  return (
    <div className="dash-layout">
      {/* ── Desktop Sidebar ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <span className="brand-icon">P</span>
            <span className="brand-text">PlaceReady</span>
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
              <span className="user-name">{user?.name || "User"}</span>
              <span className="user-email">{user?.email || ""}</span>
            </div>
          </div>
          <button id="sidebar-logout" className="sidebar-logout" onClick={handleLogout}>
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
            <span className="brand-icon">P</span>
            <span className="brand-text">PlaceReady</span>
          </div>
          <button className="drawer-close" onClick={closeMobileDrawer}>
            <X size={22} />
          </button>
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
              <span className="user-name">{user?.name || "User"}</span>
              <span className="user-email">{user?.email || ""}</span>
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
            <span className="topbar-user-name">{user?.name || "User"}</span>
            <button className="topbar-bell" aria-label="Notifications">
              <Bell size={20} strokeWidth={1.8} />
              <span className="bell-dot"></span>
            </button>
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

export default DashboardLayout;

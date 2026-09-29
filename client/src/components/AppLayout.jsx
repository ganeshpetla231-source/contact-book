import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const linkClass = ({ isActive }) => `workspace-nav-link${isActive ? " active" : ""}`;
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return <div className="workspace-shell">
    <header className="workspace-topbar"><NavLink to="/" className="workspace-brand"><span className="brand-mark">C</span><span><b>Contact Book</b><small>Personal address book</small></span></NavLink><div className="workspace-user"><button type="button" className="theme-toggle" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}>{theme === "dark" ? "Light mode" : "Dark mode"}</button><span>{user?.name || "Account"}</span><button className="workspace-logout" onClick={logout}>Sign out</button></div></header>
    <div className="workspace-body">
      <aside className="workspace-sidebar"><div><p className="workspace-kicker">YOUR SPACE</p><h1>Keep in touch.</h1><p className="workspace-muted">A colorful home for the people who matter.</p></div><nav className="workspace-nav"><NavLink to="/dashboard" className={linkClass}>⌂ <span>Dashboard</span></NavLink><NavLink to="/admin" className={linkClass}>▣ <span>Admin</span></NavLink><NavLink to="/contacts" className={linkClass}>◌ <span>Contacts</span></NavLink><NavLink to="/favorites" className={linkClass}>★ <span>Favorites</span></NavLink><NavLink to="/groups" className={linkClass}>◫ <span>Groups</span></NavLink><NavLink to="/profile" className={linkClass}>○ <span>Profile</span></NavLink></nav><div className="workspace-tip">✦ <span>Organize people into groups to find them faster.</span></div></aside>
      <main className="workspace-main">{children}</main>
    </div>
  </div>;
}

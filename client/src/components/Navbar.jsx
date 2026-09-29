import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const close = () => setOpen(false);
  const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;
  return <header className="site-header"><Link to="/dashboard" className="logo" onClick={close}><span className="logo-icon">📖</span><span><strong>Contact Book</strong><small>Personal address diary</small></span></Link><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">☰</button><nav className={`main-nav ${open ? "open" : ""}`}><NavLink to="/dashboard" className={linkClass} onClick={close}>Dashboard</NavLink><NavLink to="/contacts" className={linkClass} onClick={close}>Contacts</NavLink><NavLink to="/favorites" className={linkClass} onClick={close}>Favorites</NavLink><NavLink to="/profile" className={linkClass} onClick={close}>Profile</NavLink><button className="nav-logout" onClick={() => { logout(); close(); }}>Logout</button><span className="nav-user">{user?.name}</span></nav></header>;
}

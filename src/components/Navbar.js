// src/components/Navbar.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isEditor = location.pathname.startsWith("/editor");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div to="/" className="navbar-brand">
        <img src="/logo.png" alt="Letter Drive Logo" className="logo-icon" />
        <span>Letter Drive</span>
        </div>

        <div className={`navbar-menu ${menuOpen ? "active" : ""}`}>
          {!isDashboard && !isEditor && (
            <div className="navbar-links">
              <Link to="/" className={location.pathname === "/" ? "active" : ""}onClick={() => setMenuOpen(false)}>Home</Link>
            </div>
          )}

          <div className="navbar-auth">
            {!user ? (
              <>
                <Link to="/login" className="auth-btn login-btn"onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="auth-btn signup-btn"onClick={() => setMenuOpen(false)}>Signup</Link>
              </>
            ) : (
              <>
                {/* Show dashboard link separately */}
                {(isDashboard || isEditor) && (
                  <Link to="/dashboard" className="dashboard-link" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}

                {/* User menu */}
                <div className="user-menu">
                  <div className="user-info">
                    <img src={user.avatar || "https://i.pravatar.cc/150?img=1"} alt="User Avatar" className="user-avatar" />
                    <span className="user-name">{user.name}</span>
                  </div>
                  <div className="user-dropdown">
                  <Link to="/dashboard" className="dropdown-item logout-btn"onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                    <button className="dropdown-item logout-btn" onClick={() => { onLogout(); setMenuOpen(false); navigate("/"); }}>
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

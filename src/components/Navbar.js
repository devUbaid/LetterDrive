// src/components/Navbar.js
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isEditor = location.pathname.startsWith("/editor");
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div to="/" className="navbar-brand">
          <div className="logo-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
              <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
              <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
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
                    <button className="dropdown-item logout-btn" onClick={() => { onLogout(); setMenuOpen(false); }}>
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

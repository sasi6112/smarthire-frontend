import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/navbar.css'

const API_URL = import.meta.env.VITE_API_URL

// Shows profile picture from DB, falls back to first letter of name
function NavbarAvatar({ user }) {
  const [imgError, setImgError] = useState(false)
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?'

  if (!imgError) {
    return (
      <img
        src={`${API_URL}/api/user/profile/picture`}
        alt="Profile"
        className="navbar-pic"
        onError={() => setImgError(true)}
      />
    )
  }

  // Fallback: first letter avatar
  return <div className="navbar-initial">{initial}</div>
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/login')
  }

  function handleNavClick() {
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" onClick={handleNavClick}>⚡ SmartHire</Link>
        </div>

        {/* Desktop links */}
        <div className="navbar-links">
          {user && user.role === 'ROLE_USER' && (
            <>
              <Link to="/jobs">Browse Jobs</Link>
              <Link to="/applied-jobs">My Applications</Link>
            </>
          )}
          {user && user.role === 'ROLE_COMPANY' && (
            <>
              <Link to="/company/jobs">My Jobs</Link>
              <Link to="/company/add-job">Post Job</Link>
            </>
          )}
          {user && user.role === 'ROLE_ADMIN' && (
            <>
              <Link to="/admin/dashboard">Dashboard</Link>
              <Link to="/admin/companies">Companies</Link>
            </>
          )}
        </div>

        {/* Desktop right section */}
        <div className="navbar-right">
          {user && (
            <>
              {/* Clickable avatar - only for users */}
              {user.role === 'ROLE_USER' && (
                <div
                  className="navbar-avatar"
                  onClick={() => navigate('/profile')}
                  title="My Profile"
                >
                  <NavbarAvatar user={user} />
                </div>
              )}

              <span className="navbar-username">
                {user.name || user.companyName || 'Admin'}
              </span>

              {user.role === 'ROLE_USER' && (
                <button className="btn-profile" onClick={() => navigate('/profile')}>
                  My Profile
                </button>
              )}

              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger button (mobile only) */}
        {user && (
          <button
            id="navbar-hamburger-btn"
            className={`navbar-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </nav>

      {/* Mobile slide-down menu */}
      {user && (
        <div className={`navbar-mobile-menu${menuOpen ? ' open' : ''}`} id="navbar-mobile-menu">
          {/* User info row */}
          <div className="navbar-mobile-user">
            {user.role === 'ROLE_USER' && (
              <div className="navbar-avatar" style={{ width: 36, height: 36 }}>
                <NavbarAvatar user={user} />
              </div>
            )}
            <span>{user.name || user.companyName || 'Admin'}</span>
          </div>

          <div className="navbar-mobile-divider" />

          {/* Role-based nav links */}
          {user.role === 'ROLE_USER' && (
            <>
              <Link to="/jobs" onClick={handleNavClick}>Browse Jobs</Link>
              <Link to="/applied-jobs" onClick={handleNavClick}>My Applications</Link>
              <Link to="/profile" onClick={handleNavClick}>My Profile</Link>
            </>
          )}
          {user.role === 'ROLE_COMPANY' && (
            <>
              <Link to="/company/jobs" onClick={handleNavClick}>My Jobs</Link>
              <Link to="/company/add-job" onClick={handleNavClick}>Post Job</Link>
            </>
          )}
          {user.role === 'ROLE_ADMIN' && (
            <>
              <Link to="/admin/dashboard" onClick={handleNavClick}>Dashboard</Link>
              <Link to="/admin/companies" onClick={handleNavClick}>Companies</Link>
            </>
          )}

          <div className="navbar-mobile-divider" />

          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </>
  )
}

export default Navbar

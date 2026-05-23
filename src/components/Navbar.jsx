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

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">⚡ SmartHire</Link>
      </div>

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

      <div className="navbar-right">
        {user && (
          <>
            {/* Clickable avatar - only for users, shows pic or first letter */}
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
    </nav>
  )
}

export default Navbar

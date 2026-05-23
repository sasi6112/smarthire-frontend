import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getMyApplications, getCompanyJobs } from '../services/api'
import '../styles/dashboard.css'

function Dashboard() {
  const { user, refreshAccessToken, logout } = useAuth()
  const navigate = useNavigate()
  const [stats,   setStats]   = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      if (user.role === 'ROLE_USER') {
        const res = await getMyApplications(refreshAccessToken, logout)
        if (res.ok) {
          const data = await res.json()
          setStats({
            total:       data.length,
            pending:     data.filter(a => a.status === 'PENDING').length,
            shortlisted: data.filter(a => a.status === 'SHORTLISTED').length,
            rejected:    data.filter(a => a.status === 'REJECTED').length
          })
        }
      } else if (user.role === 'ROLE_COMPANY') {
        const res = await getCompanyJobs(refreshAccessToken, logout)
        if (res.ok) {
          const data = await res.json()
          setStats({ totalJobs: data.length })
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>Welcome, {user.name || user.companyName || 'Admin'} 👋</h1>
        <p className="page-subtitle">Dashboard Overview</p>

        {loading && <p className="loading-text">Loading...</p>}

        {!loading && user.role === 'ROLE_USER' && (
          <div className="stats-row">
            <div className="stat-box blue">
              <div className="stat-number">{stats.total || 0}</div>
              <div className="stat-label">Total Applied</div>
            </div>
            <div className="stat-box yellow">
              <div className="stat-number">{stats.pending || 0}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-box green">
              <div className="stat-number">{stats.shortlisted || 0}</div>
              <div className="stat-label">Shortlisted</div>
            </div>
            <div className="stat-box red">
              <div className="stat-number">{stats.rejected || 0}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
        )}

        {!loading && user.role === 'ROLE_COMPANY' && (
          <div className="stats-row">
            <div className="stat-box blue">
              <div className="stat-number">{stats.totalJobs || 0}</div>
              <div className="stat-label">Active Jobs</div>
            </div>
          </div>
        )}

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            {user.role === 'ROLE_USER' && (
              <>
                <button className="action-btn" onClick={() => navigate('/jobs')}>🔍 Browse Jobs</button>
                <button className="action-btn" onClick={() => navigate('/applied-jobs')}>📋 My Applications</button>
                <button className="action-btn" onClick={() => navigate('/profile')}>👤 My Profile</button>
              </>
            )}
            {user.role === 'ROLE_COMPANY' && (
              <>
                <button className="action-btn" onClick={() => navigate('/company/jobs')}>💼 My Job Posts</button>
                <button className="action-btn" onClick={() => navigate('/company/add-job')}>➕ Post New Job</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

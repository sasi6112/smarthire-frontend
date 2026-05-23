import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getPendingCompanies, getAllCompanies, getAllJobsAdmin } from '../services/api'
import '../styles/dashboard.css'

function AdminDashboard() {
  const { refreshAccessToken, logout } = useAuth()
  const navigate = useNavigate()
  const [stats,   setStats]   = useState({ companies: 0, pending: 0, jobs: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const [allRes, pendingRes, jobsRes] = await Promise.all([
        getAllCompanies(refreshAccessToken, logout),
        getPendingCompanies(refreshAccessToken, logout),
        getAllJobsAdmin(refreshAccessToken, logout)
      ])
      const companies = allRes.ok     ? await allRes.json()     : []
      const pending   = pendingRes.ok ? await pendingRes.json() : []
      const jobs      = jobsRes.ok    ? await jobsRes.json()    : []
      setStats({
        companies: companies.length,
        pending:   pending.length,
        jobs:      jobs.length
      })
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
        <h1>Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview</p>

        {loading && <p className="loading-text">Loading...</p>}

        {!loading && (
          <>
            <div className="stats-row">
              <div className="stat-box blue" onClick={() => navigate('/admin/companies')}>
                <div className="stat-number">{stats.companies}</div>
                <div className="stat-label">Total Companies</div>
              </div>
              <div className="stat-box yellow" onClick={() => navigate('/admin/companies')}>
                <div className="stat-number">{stats.pending}</div>
                <div className="stat-label">Pending Approvals</div>
              </div>
              <div className="stat-box green">
                <div className="stat-number">{stats.jobs}</div>
                <div className="stat-label">Total Jobs</div>
              </div>
            </div>

            {stats.pending > 0 && (
              <div className="alert-box" onClick={() => navigate('/admin/companies')}>
                ⚠️ {stats.pending} company approval(s) pending — Click to review
              </div>
            )}

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => navigate('/admin/companies')}>
                  ✅ Company Approvals
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getMyApplications, getErrorMessage } from '../services/api'
import '../styles/dashboard.css'

function AppliedJobs() {
  const { refreshAccessToken, logout } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [errorMsg,     setErrorMsg]     = useState('')
  const [filter,       setFilter]       = useState('ALL')

  useEffect(() => {
    loadApplications()
  }, [])

  async function loadApplications() {
    try {
      const res = await getMyApplications(refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      setApplications(await res.json())
    } catch (err) {
      setErrorMsg('Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  const displayed = filter === 'ALL'
    ? applications
    : applications.filter(a => a.status === filter)

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>My Applications</h1>
        <p className="page-subtitle">{applications.length} total application(s)</p>

        {errorMsg && <div className="error-box">{errorMsg}</div>}

        <div className="filter-tabs">
          {['ALL', 'PENDING', 'SHORTLISTED', 'REJECTED'].map(s => (
            <button
              key={s}
              className={filter === s ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setFilter(s)}
            >
              {s} ({s === 'ALL' ? applications.length : applications.filter(a => a.status === s).length})
            </button>
          ))}
        </div>

        {loading && <p className="loading-text">Loading...</p>}

        {!loading && displayed.length === 0 && (
          <div className="empty-state"><p>No applications found.</p></div>
        )}

        <div className="applications-list">
          {displayed.map(app => (
            <div key={app.id} className="application-card">
              <div className="app-info">
                <h3>{app.jobTitle}</h3>
                <p className="app-company">{app.companyName}</p>
                <div className="app-tags">
                  {app.location  && <span>📍 {app.location}</span>}
                  {app.salary    && <span>💰 ₹{app.salary.toLocaleString()}</span>}
                  {app.technology && <span>💻 {app.technology}</span>}
                </div>
                <p className="app-date">
                  Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}
                </p>
              </div>
              <div className="app-status">
                <span className={`status-badge status-${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
                {app.status === 'SHORTLISTED' && (
                  <p className="status-note">🎉 You have been shortlisted!</p>
                )}
                {app.status === 'REJECTED' && (
                  <p className="status-note">Keep trying! Better opportunities ahead.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AppliedJobs

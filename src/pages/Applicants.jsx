import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getApplicants, updateApplicationStatus, getErrorMessage } from '../services/api'
import '../styles/dashboard.css'

const API_URL = import.meta.env.VITE_API_URL

function Applicants() {
  const { jobId }  = useParams()
  const navigate   = useNavigate()
  const { refreshAccessToken, logout } = useAuth()

  const [applicants, setApplicants] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [errorMsg,   setErrorMsg]   = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    loadApplicants()
  }, [jobId])

  async function loadApplicants() {
    try {
      const res = await getApplicants(jobId, refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      setApplicants(await res.json())
    } catch (err) {
      setErrorMsg('Failed to load applicants.')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatus(appId, status) {
    try {
      const res = await updateApplicationStatus(appId, status, refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
      setSuccessMsg('Status updated successfully.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setErrorMsg('Failed to update status.')
    }
  }

  async function downloadResume(appId, filename) {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${API_URL}/api/files/resume/${appId}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      if (!res.ok) { setErrorMsg('Resume not found.'); return }
      const blob = await res.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = filename || 'resume.pdf'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setErrorMsg('Failed to download resume.')
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <button className="btn-back" onClick={() => navigate('/company/jobs')}>
          ← Back to Jobs
        </button>
        <h1>Applicants</h1>
        <p className="page-subtitle">{applicants.length} applicant(s)</p>

        {errorMsg   && <div className="error-box">{errorMsg}</div>}
        {successMsg && <div className="success-box">{successMsg}</div>}
        {loading    && <p className="loading-text">Loading...</p>}

        {!loading && applicants.length === 0 && (
          <div className="empty-state"><p>No applicants yet for this job.</p></div>
        )}

        <div className="applicants-list">
          {applicants.map(app => (
            <div key={app.id} className="applicant-card">
              <div className="applicant-left">
                <div className="applicant-avatar">
                  {app.userName ? app.userName.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h3>{app.userName}</h3>
                  <p style={{ fontSize: 13, color: '#555' }}>{app.userEmail}</p>
                  <div className="app-tags">
                    {app.highestDegree   && <span>🎓 {app.highestDegree}</span>}
                    {app.userExperience  && <span>⏳ {app.userExperience}</span>}
                    {app.previousCompany && <span>🏢 {app.previousCompany}</span>}
                  </div>
                  {app.skills && app.skills.length > 0 && (
                    <div className="skills-wrap" style={{ marginTop: 6 }}>
                      {app.skills.map((s, i) => (
                        <span key={i} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  )}
                  {app.certifications && app.certifications.length > 0 && (
                    <div className="skills-wrap" style={{ marginTop: 4 }}>
                      {app.certifications.map((c, i) => (
                        <span key={i} className="cert-tag">🏆 {c}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="applicant-right">
                <span className={`status-badge status-${app.status.toLowerCase()}`}>
                  {app.status}
                </span>

                {app.hasResume && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => downloadResume(app.id, app.resumeFilename)}
                  >
                    📄 Resume
                  </button>
                )}

                <button
                  className="btn btn-success btn-sm"
                  disabled={app.status === 'SHORTLISTED'}
                  onClick={() => handleStatus(app.id, 'SHORTLISTED')}
                >
                  ✅ Shortlist
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  disabled={app.status === 'REJECTED'}
                  onClick={() => handleStatus(app.id, 'REJECTED')}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Applicants

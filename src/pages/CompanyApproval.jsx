import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import {
  getPendingCompanies, getAllCompanies,
  approveCompany, rejectCompany,
  blockCompany, unblockCompany,
  getErrorMessage
} from '../services/api'
import '../styles/dashboard.css'

function CompanyApproval() {
  const { refreshAccessToken, logout } = useAuth()
  const [companies,  setCompanies]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [errorMsg,   setErrorMsg]   = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [activeTab,  setActiveTab]  = useState('PENDING')

  useEffect(() => {
    loadCompanies()
  }, [activeTab])

  async function loadCompanies() {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = activeTab === 'PENDING'
        ? await getPendingCompanies(refreshAccessToken, logout)
        : await getAllCompanies(refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      const data = await res.json()
      setCompanies(activeTab === 'ALL' ? data.filter(c => c.approved) : data)
    } catch (err) {
      setErrorMsg('Failed to load companies.')
    } finally {
      setLoading(false)
    }
  }

  function showSuccess(msg) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  async function handleApprove(id) {
    try {
      const res = await approveCompany(id, refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      setCompanies(prev => prev.filter(c => c.id !== id))
      showSuccess('Company approved! They can now login.')
    } catch (err) { setErrorMsg('Failed to approve.') }
  }

  async function handleReject(id) {
    if (!window.confirm('Reject and permanently delete this company?')) return
    try {
      const res = await rejectCompany(id, refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      setCompanies(prev => prev.filter(c => c.id !== id))
      showSuccess('Company rejected and removed.')
    } catch (err) { setErrorMsg('Failed to reject.') }
  }

  async function handleBlock(id) {
    if (!window.confirm('Block this company? They will not be able to login.')) return
    try {
      const res = await blockCompany(id, refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, blocked: true } : c))
      showSuccess('Company blocked.')
    } catch (err) { setErrorMsg('Failed to block.') }
  }

  async function handleUnblock(id) {
    try {
      const res = await unblockCompany(id, refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, blocked: false } : c))
      showSuccess('Company unblocked. They can login again.')
    } catch (err) { setErrorMsg('Failed to unblock.') }
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>Company Management</h1>
        <p className="page-subtitle">Approve, reject, block or unblock companies</p>

        {errorMsg   && <div className="error-box">{errorMsg}</div>}
        {successMsg && <div className="success-box">{successMsg}</div>}

        <div className="filter-tabs">
          <button
            className={activeTab === 'PENDING' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('PENDING')}
          >
            ⏳ Pending Approval
          </button>
          <button
            className={activeTab === 'ALL' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('ALL')}
          >
            🏢 Approved Companies
          </button>
        </div>

        {loading && <p className="loading-text">Loading...</p>}

        {!loading && companies.length === 0 && (
          <div className="empty-state">
            <p>{activeTab === 'PENDING' ? '✅ No pending approvals.' : 'No approved companies yet.'}</p>
          </div>
        )}

        <div className="companies-list">
          {companies.map(company => (
            <div key={company.id} className="company-card">
              <div className="company-info">
                <div
                  className="company-avatar"
                  style={{ background: company.blocked ? '#dc2626' : '#2563eb' }}
                >
                  {company.companyName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{company.companyName}</h3>
                  <p style={{ fontSize: 13, color: '#555' }}>{company.email}</p>
                  <div className="app-tags">
                    {company.industry && <span>🏭 {company.industry}</span>}
                    {company.location && <span>📍 {company.location}</span>}
                    {company.website  && <span>🌐 {company.website}</span>}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    {company.blocked
                      ? <span className="status-badge status-rejected">🚫 BLOCKED</span>
                      : <span className="status-badge status-shortlisted">✅ ACTIVE</span>
                    }
                  </div>
                </div>
              </div>

              <div className="company-actions">
                {activeTab === 'PENDING' && (
                  <>
                    <button className="btn btn-success" onClick={() => handleApprove(company.id)}>
                      ✅ Approve
                    </button>
                    <button className="btn btn-danger" onClick={() => handleReject(company.id)}>
                      ❌ Reject
                    </button>
                  </>
                )}
                {activeTab === 'ALL' && (
                  <>
                    {company.blocked
                      ? <button className="btn btn-success" onClick={() => handleUnblock(company.id)}>
                          🔓 Unblock
                        </button>
                      : <button className="btn btn-danger" onClick={() => handleBlock(company.id)}>
                          🚫 Block
                        </button>
                    }
                    <button className="btn btn-outline btn-sm"
                      onClick={() => handleReject(company.id)}>
                      🗑 Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CompanyApproval

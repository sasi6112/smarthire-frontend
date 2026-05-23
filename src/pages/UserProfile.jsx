import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import {
  getUserProfile, updateUserProfile, updateResume,
  deleteResume, uploadProfilePicture, deleteProfilePicture,
  getErrorMessage, getFieldError
} from '../services/api'
import '../styles/profile.css'

const API_URL = import.meta.env.VITE_API_URL

function UserProfile() {
  const { refreshAccessToken, logout } = useAuth()

  const [profile,       setProfile]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [errorMsg,      setErrorMsg]      = useState('')
  const [successMsg,    setSuccessMsg]    = useState('')
  const [editMode,      setEditMode]      = useState(false)
  const [picLoading,    setPicLoading]    = useState(false)
  const [resumeLoading, setResumeLoading] = useState(false)
  const [picTs,         setPicTs]         = useState(Date.now())

  // Edit form fields
  const [name,            setName]            = useState('')
  const [highestDegree,   setHighestDegree]   = useState('')
  const [experience,      setExperience]      = useState('')
  const [previousCompany, setPreviousCompany] = useState('')
  const [skills,          setSkills]          = useState([''])
  const [certs,           setCerts]           = useState([''])
  const [formErrors,      setFormErrors]      = useState({})

  const pictureRef = useRef()
  const resumeRef  = useRef()

  useEffect(() => {
    loadProfile()
  }, [])

  // useEffect validates name when editing
  useEffect(() => {
    if (!editMode || !name) return
    const t = setTimeout(() => {
      setFormErrors(p => ({ ...p, name: validateName(name) }))
    }, 400)
    return () => clearTimeout(t)
  }, [name, editMode])

  function validateName(val) {
    if (!val || !val.trim()) return 'Name is required.'
    if (val.trim().length < 2) return 'Name must be at least 2 characters.'
    for (let c of val.trim()) {
      if (!/[a-zA-Z ]/.test(c)) return 'Name can only contain letters and spaces.'
    }
    return ''
  }

  async function loadProfile() {
    setLoading(true)
    try {
      const res = await getUserProfile(refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      const data = await res.json()
      setProfile(data)
      setName(data.name || '')
      setHighestDegree(data.highestDegree || '')
      setExperience(data.experience || '')
      setPreviousCompany(data.previousCompany || '')
      setSkills(data.skills && data.skills.length > 0 ? data.skills : [''])
      setCerts(data.certifications && data.certifications.length > 0 ? data.certifications : [''])
    } catch (err) {
      setErrorMsg('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  function showSuccess(msg) {
    setSuccessMsg(msg)
    setErrorMsg('')
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  function showError(msg) {
    setErrorMsg(msg)
    setSuccessMsg('')
  }

  async function handleSaveProfile() {
    const nameErr = validateName(name)
    if (nameErr) {
      setFormErrors({ name: nameErr })
      return
    }

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('highestDegree', highestDegree)
    formData.append('experience', experience)
    formData.append('previousCompany', previousCompany)
    skills.filter(s => s.trim()).forEach(s => formData.append('skills', s))
    certs.filter(c => c.trim()).forEach(c => formData.append('certifications', c))

    try {
      const res = await updateUserProfile(formData, refreshAccessToken, logout)
      if (!res.ok) {
        const err = await getFieldError(res)
        if (err.field) setFormErrors({ [err.field]: err.message })
        else showError(err.message)
        return
      }
      setProfile(await res.json())
      setEditMode(false)
      setFormErrors({})
      showSuccess('Profile updated successfully!')
    } catch (err) {
      showError('Failed to update profile.')
    }
  }

  async function handlePictureChange(e) {
    const file = e.target.files[0]
    if (!file) return

    // Frontend validation before sending to backend
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      showError('Only JPG or PNG images are allowed.')
      e.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showError('Image must be under 2MB.')
      e.target.value = ''
      return
    }

    setPicLoading(true)
    const formData = new FormData()
    formData.append('picture', file)

    try {
      const res = await uploadProfilePicture(formData, refreshAccessToken, logout)
      if (!res.ok) { showError(await getErrorMessage(res)); return }
      setProfile(await res.json())
      setPicTs(Date.now())
      showSuccess('Profile picture updated!')
    } catch (err) {
      showError('Failed to upload picture.')
    } finally {
      setPicLoading(false)
      e.target.value = ''
    }
  }

  async function handleDeletePicture() {
    if (!window.confirm('Remove your profile picture?')) return
    setPicLoading(true)
    try {
      const res = await deleteProfilePicture(refreshAccessToken, logout)
      if (!res.ok) { showError(await getErrorMessage(res)); return }
      setProfile(await res.json())
      setPicTs(Date.now())
      showSuccess('Profile picture removed.')
    } catch (err) {
      showError('Failed to remove picture.')
    } finally {
      setPicLoading(false)
    }
  }

  async function handleResumeChange(e) {
    const file = e.target.files[0]
    if (!file) return

    // Frontend validation
    if (file.type !== 'application/pdf') {
      showError('Only PDF files are allowed for resume.')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Resume must be under 5MB.')
      e.target.value = ''
      return
    }

    setResumeLoading(true)
    const formData = new FormData()
    formData.append('resume', file)

    try {
      const res = await updateResume(formData, refreshAccessToken, logout)
      if (!res.ok) { showError(await getErrorMessage(res)); return }
      setProfile(await res.json())
      showSuccess('Resume updated successfully!')
    } catch (err) {
      showError('Failed to upload resume.')
    } finally {
      setResumeLoading(false)
      e.target.value = ''
    }
  }

  async function handleDeleteResume() {
    if (!window.confirm('Delete your resume permanently?')) return
    setResumeLoading(true)
    try {
      const res = await deleteResume(refreshAccessToken, logout)
      if (!res.ok) { showError(await getErrorMessage(res)); return }
      setProfile(await res.json())
      showSuccess('Resume deleted.')
    } catch (err) {
      showError('Failed to delete resume.')
    } finally {
      setResumeLoading(false)
    }
  }

  function handleViewResume() {
    const token = localStorage.getItem('accessToken')
    fetch(`${API_URL}/api/user/profile/resume-view`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.blob())
      .then(blob => window.open(window.URL.createObjectURL(blob), '_blank'))
      .catch(() => showError('Could not open resume.'))
  }

  function addSkill()          { setSkills([...skills, '']) }
  function removeSkill(i)      { setSkills(skills.filter((_, idx) => idx !== i)) }
  function updateSkill(i, val) { const c = [...skills]; c[i] = val; setSkills(c) }
  function addCert()           { setCerts([...certs, '']) }
  function removeCert(i)       { setCerts(certs.filter((_, idx) => idx !== i)) }
  function updateCert(i, val)  { const c = [...certs]; c[i] = val; setCerts(c) }

  if (loading) return (
    <div><Navbar />
      <div className="page-container"><p className="loading-text">Loading profile...</p></div>
    </div>
  )

  if (!profile) return (
    <div><Navbar />
      <div className="page-container"><div className="error-box">{errorMsg || 'Failed to load.'}</div></div>
    </div>
  )

  // First letter of name as avatar fallback
  const initials = profile.name ? profile.name.charAt(0).toUpperCase() : '?'

  return (
    <div>
      <Navbar />
      <div className="page-container">

        {errorMsg   && <div className="error-box">{errorMsg}</div>}
        {successMsg && <div className="success-box">{successMsg}</div>}

        {/* ── PROFILE HEADER ── */}
        <div className="profile-header-card">

          {/* Profile Picture Section */}
          <div className="profile-pic-section">
            <div className="profile-pic-wrapper">
              {/* Show uploaded picture OR first letter avatar */}
              {profile.hasProfilePicture ? (
                <img
                  src={`${API_URL}/api/user/profile/picture?t=${picTs}`}
                  alt="Profile"
                  className="profile-pic-img"
                />
              ) : (
                <div className="profile-pic-initials">{initials}</div>
              )}
            </div>

            <div className="pic-actions">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                ref={pictureRef}
                style={{ display: 'none' }}
                onChange={handlePictureChange}
              />
              <button
                className="btn btn-outline btn-sm"
                onClick={() => pictureRef.current.click()}
                disabled={picLoading}
              >
                {profile.hasProfilePicture ? '🖼 Change Photo' : '📷 Upload Photo'}
              </button>
              {profile.hasProfilePicture && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleDeletePicture}
                  disabled={picLoading}
                >
                  Remove
                </button>
              )}
            </div>
            <p className="pic-hint">JPG or PNG · max 2MB</p>
          </div>

          {/* Name and Info */}
          <div className="profile-header-info">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-email">📧 {profile.email}</p>
            {profile.highestDegree   && <p className="profile-meta">🎓 {profile.highestDegree}</p>}
            {profile.experience      && <p className="profile-meta">⏳ {profile.experience}</p>}
            {profile.previousCompany && <p className="profile-meta">🏢 {profile.previousCompany}</p>}
            <div style={{ marginTop: 14 }}>
              <button
                className="btn btn-primary"
                onClick={() => { setEditMode(!editMode); setFormErrors({}) }}
              >
                {editMode ? '✕ Cancel Edit' : '✏️ Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* ── EDIT FORM ── */}
        {editMode && (
          <div className="profile-card">
            <h2>Edit Profile Details</h2>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className={formErrors.name ? 'input-error' : ''}
              />
              {formErrors.name && <span className="field-error">{formErrors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Highest Degree</label>
                <select value={highestDegree} onChange={e => setHighestDegree(e.target.value)}>
                  <option value="">-- Select --</option>
                  <option>High School</option>
                  <option>Diploma</option>
                  <option>Bachelor's</option>
                  <option>Master's</option>
                  <option>PhD</option>
                </select>
              </div>
              <div className="form-group">
                <label>Experience Level</label>
                <select value={experience} onChange={e => setExperience(e.target.value)}>
                  <option value="">-- Select --</option>
                  <option>Fresher</option>
                  <option>Experienced</option>
                </select>
              </div>
            </div>

            {experience === 'Experienced' && (
              <div className="form-group">
                <label>Previous Company</label>
                <input
                  value={previousCompany}
                  onChange={e => setPreviousCompany(e.target.value)}
                  placeholder="Company name"
                />
              </div>
            )}

            <div className="form-group">
              <label>Skills</label>
              {skills.map((s, i) => (
                <div key={i} className="list-row">
                  <input
                    value={s}
                    onChange={e => updateSkill(i, e.target.value)}
                    placeholder={`Skill ${i + 1} e.g. React`}
                  />
                  {skills.length > 1 && (
                    <button type="button" className="btn-remove" onClick={() => removeSkill(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addSkill}>
                + Add Skill
              </button>
            </div>

            <div className="form-group">
              <label>Certifications</label>
              {certs.map((c, i) => (
                <div key={i} className="list-row">
                  <input
                    value={c}
                    onChange={e => updateCert(i, e.target.value)}
                    placeholder={`Certification ${i + 1} e.g. AWS`}
                  />
                  {certs.length > 1 && (
                    <button type="button" className="btn-remove" onClick={() => removeCert(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addCert}>
                + Add Certification
              </button>
            </div>

            <div className="form-actions">
              <button className="btn btn-outline"
                onClick={() => { setEditMode(false); setFormErrors({}) }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ── VIEW: SKILLS AND CERTS ── */}
        {!editMode && (
          <div className="profile-details-row">
            <div className="profile-card">
              <h2>Skills</h2>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="skills-wrap">
                  {profile.skills.map((s, i) => (
                    <span key={i} className="skill-tag">{s}</span>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No skills added yet. Click Edit Profile to add.</p>
              )}
            </div>

            <div className="profile-card">
              <h2>Certifications</h2>
              {profile.certifications && profile.certifications.length > 0 ? (
                <div className="skills-wrap">
                  {profile.certifications.map((c, i) => (
                    <span key={i} className="cert-tag">🏆 {c}</span>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No certifications added yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ── RESUME CARD ── */}
        <div className="profile-card">
          <h2>Resume</h2>

          {profile.hasResume ? (
            <div className="resume-section">
              <div className="resume-info">
                <span className="resume-icon">📄</span>
                <div>
                  <p className="resume-filename">{profile.resumeFilename || 'resume.pdf'}</p>
                  <p className="resume-hint">Stored securely in database</p>
                </div>
              </div>
              <div className="resume-actions">
                <button className="btn btn-outline btn-sm" onClick={handleViewResume}>
                  👁 View
                </button>
                <input
                  type="file"
                  accept=".pdf"
                  ref={resumeRef}
                  style={{ display: 'none' }}
                  onChange={handleResumeChange}
                />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => resumeRef.current.click()}
                  disabled={resumeLoading}
                >
                  🔄 Replace
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleDeleteResume}
                  disabled={resumeLoading}
                >
                  🗑 Delete
                </button>
              </div>
              <p className="resume-hint" style={{ marginTop: 8 }}>
                ✅ This resume is automatically submitted when you apply for jobs.
              </p>
            </div>
          ) : (
            <div className="resume-upload-section">
              <p className="empty-text">No resume uploaded yet.</p>
              <input
                type="file"
                accept=".pdf"
                ref={resumeRef}
                style={{ display: 'none' }}
                onChange={handleResumeChange}
              />
              <button
                className="btn btn-primary"
                onClick={() => resumeRef.current.click()}
                disabled={resumeLoading}
              >
                {resumeLoading ? 'Uploading...' : '📤 Upload Resume (PDF)'}
              </button>
              <p className="resume-hint">PDF only · max 5MB</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default UserProfile

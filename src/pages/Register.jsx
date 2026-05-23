import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, getFieldError } from '../services/api'
import '../styles/forms.css'

function Register() {
  const navigate = useNavigate()

  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [highestDegree,   setHighestDegree]   = useState('')
  const [experience,      setExperience]      = useState('')
  const [previousCompany, setPreviousCompany] = useState('')
  const [skills,          setSkills]          = useState([''])
  const [certs,           setCerts]           = useState([''])
  const [resumeFile,      setResumeFile]      = useState(null)

  const [errors,    setErrors]    = useState({})
  const [serverErr, setServerErr] = useState('')
  const [successMsg,setSuccessMsg]= useState('')
  const [loading,   setLoading]   = useState(false)

  // ── useEffect validators for each field ──────────────────────

  useEffect(() => {
    if (!name) return
    const t = setTimeout(() => {
      setErrors(p => ({ ...p, name: validateName(name) }))
    }, 400)
    return () => clearTimeout(t)
  }, [name])

  useEffect(() => {
    if (!email) return
    const t = setTimeout(() => {
      setErrors(p => ({ ...p, email: validateEmail(email) }))
    }, 500)
    return () => clearTimeout(t)
  }, [email])

  useEffect(() => {
    if (!password) return
    const t = setTimeout(() => {
      setErrors(p => ({ ...p, password: validatePassword(password) }))
    }, 400)
    return () => clearTimeout(t)
  }, [password])

  useEffect(() => {
    if (!previousCompany) return
    const t = setTimeout(() => {
      if (experience === 'Experienced' && !previousCompany.trim()) {
        setErrors(p => ({ ...p, previousCompany: 'Previous company is required.' }))
      } else {
        setErrors(p => ({ ...p, previousCompany: '' }))
      }
    }, 300)
    return () => clearTimeout(t)
  }, [previousCompany, experience])

  // ── Frontend validation functions (mirror backend rules) ─────

  function validateName(val) {
    if (!val || !val.trim()) return 'Full name is required.'
    if (val.trim().length < 2) return 'Name must be at least 2 characters.'
    if (val.trim().length > 100) return 'Name must be less than 100 characters.'
    for (let c of val.trim()) {
      if (!/[a-zA-Z ]/.test(c)) return 'Name can only contain letters and spaces.'
    }
    return ''
  }

  function validateEmail(val) {
    if (!val || !val.trim()) return 'Email is required.'
    if (!val.includes('@')) return 'Email must contain @ symbol. Example: john@gmail.com'
    const parts = val.split('@')
    if (parts[0].length === 0) return 'Enter username before @.'
    if (!parts[1] || !parts[1].includes('.')) return 'Enter valid domain. Example: gmail.com'
    const validDomains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','rediffmail.com','ymail.com','co.in','org','net','edu']
    const domain = parts[1].toLowerCase()
    const valid = validDomains.some(d => domain === d || domain.endsWith('.' + d))
    if (!valid) return `Domain "${parts[1]}" not accepted. Use gmail.com, yahoo.com, outlook.com etc.`
    return ''
  }

  function validatePassword(val) {
    if (!val) return 'Password is required.'
    if (val.length < 8) return 'Password must be at least 8 characters.'
    if (!/[A-Z]/.test(val)) return 'Password must contain at least one uppercase letter (A-Z).'
    if (!/[a-z]/.test(val)) return 'Password must contain at least one lowercase letter (a-z).'
    if (!/[0-9]/.test(val)) return 'Password must contain at least one number (0-9).'
    if (!/[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(val)) return 'Password must contain at least one special character (!@#$% etc.).'
    return ''
  }

  // ── Skills / Certs helpers ───────────────────────────────────

  function addSkill()          { setSkills([...skills, '']) }
  function removeSkill(i)      { setSkills(skills.filter((_, idx) => idx !== i)) }
  function updateSkill(i, val) { const c = [...skills]; c[i] = val; setSkills(c) }
  function addCert()           { setCerts([...certs, '']) }
  function removeCert(i)       { setCerts(certs.filter((_, idx) => idx !== i)) }
  function updateCert(i, val)  { const c = [...certs]; c[i] = val; setCerts(c) }

  // ── Resume file validation ───────────────────────────────────

  function handleResumeChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setErrors(p => ({ ...p, resume: 'Only PDF files are allowed.' }))
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(p => ({ ...p, resume: 'Resume must be under 5MB.' }))
      e.target.value = ''
      return
    }
    setErrors(p => ({ ...p, resume: '' }))
    setResumeFile(file)
  }

  // ── Submit ───────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault()

    const nameErr     = validateName(name)
    const emailErr    = validateEmail(email)
    const passwordErr = validatePassword(password)
    const prevErr     = experience === 'Experienced' && !previousCompany.trim()
                        ? 'Previous company is required.' : ''

    if (nameErr || emailErr || passwordErr || prevErr) {
      setErrors({ name: nameErr, email: emailErr, password: passwordErr, previousCompany: prevErr })
      return
    }

    setLoading(true)
    setServerErr('')

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('email', email.trim())
    formData.append('password', password)
    if (highestDegree)   formData.append('highestDegree', highestDegree)
    if (experience)      formData.append('experience', experience)
    if (previousCompany) formData.append('previousCompany', previousCompany.trim())
    skills.filter(s => s.trim()).forEach(s => formData.append('skills', s))
    certs.filter(c => c.trim()).forEach(c => formData.append('certifications', c))
    if (resumeFile)      formData.append('resume', resumeFile)

    try {
      const res = await registerUser(formData)
      if (!res.ok) {
        const err = await getFieldError(res)
        if (err.field) setErrors(p => ({ ...p, [err.field]: err.message }))
        else setServerErr(err.message)
        return
      }
      setSuccessMsg('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setServerErr('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box auth-box-wide">
        <h1 className="auth-logo">⚡ SmartHire</h1>
        <h2>Create Your Account</h2>

        {serverErr  && <div className="error-box">{serverErr}</div>}
        {successMsg && <div className="success-box">{successMsg}</div>}

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="form-group">
            <label>Full Name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="John Doe" className={errors.name ? 'input-error' : ''} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email *</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="john@gmail.com" className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 chars, uppercase, number, special char"
              className={errors.password ? 'input-error' : ''} />
            {errors.password && <span className="field-error">{errors.password}</span>}
            {/* Password strength hints */}
            {password && !errors.password && (
              <span className="field-success">✅ Password looks strong!</span>
            )}
          </div>

          {/* Degree */}
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

          {/* Experience */}
          <div className="form-group">
            <label>Experience Level</label>
            <select value={experience} onChange={e => setExperience(e.target.value)}>
              <option value="">-- Select --</option>
              <option>Fresher</option>
              <option>Experienced</option>
            </select>
          </div>

          {/* Previous Company - shown only when Experienced */}
          {experience === 'Experienced' && (
            <div className="form-group">
              <label>Previous Company *</label>
              <input value={previousCompany}
                onChange={e => setPreviousCompany(e.target.value)}
                placeholder="Company name"
                className={errors.previousCompany ? 'input-error' : ''} />
              {errors.previousCompany && <span className="field-error">{errors.previousCompany}</span>}
            </div>
          )}

          {/* Skills */}
          <div className="form-group">
            <label>Skills</label>
            {skills.map((skill, i) => (
              <div key={i} className="list-row">
                <input value={skill} onChange={e => updateSkill(i, e.target.value)}
                  placeholder={`Skill ${i + 1} e.g. React`} />
                {skills.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => removeSkill(i)}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addSkill}>+ Add Skill</button>
          </div>

          {/* Certifications */}
          <div className="form-group">
            <label>Certifications</label>
            {certs.map((cert, i) => (
              <div key={i} className="list-row">
                <input value={cert} onChange={e => updateCert(i, e.target.value)}
                  placeholder={`Certification ${i + 1} e.g. AWS`} />
                {certs.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => removeCert(i)}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addCert}>+ Add Certification</button>
          </div>

          {/* Resume */}
          <div className="form-group">
            <label>Resume (PDF only, max 5MB)</label>
            <input type="file" accept=".pdf" onChange={handleResumeChange}
              className={errors.resume ? 'input-error' : ''} />
            {errors.resume  && <span className="field-error">{errors.resume}</span>}
            {resumeFile && !errors.resume && (
              <span className="field-success">✅ {resumeFile.name} selected</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-links">
          <p>Already have account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Register

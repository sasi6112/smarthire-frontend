import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerCompany, getFieldError } from '../services/api'
import '../styles/forms.css'

function CompanyRegister() {
  const navigate = useNavigate()

  const [companyName, setCompanyName] = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [industry,    setIndustry]    = useState('')
  const [location,    setLocation]    = useState('')
  const [website,     setWebsite]     = useState('')

  const [errors,     setErrors]     = useState({})
  const [serverErr,  setServerErr]  = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading,    setLoading]    = useState(false)

  // useEffect validates each field when it changes

  useEffect(() => {
    if (!companyName) return
    const t = setTimeout(() => {
      setErrors(p => ({ ...p, companyName: validateCompanyName(companyName) }))
    }, 400)
    return () => clearTimeout(t)
  }, [companyName])

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
    if (!location) return
    const t = setTimeout(() => {
      setErrors(p => ({ ...p, location: !location.trim() ? 'Location is required.' : '' }))
    }, 300)
    return () => clearTimeout(t)
  }, [location])

  function validateCompanyName(val) {
    if (!val || !val.trim()) return 'Company name is required.'
    if (val.trim().length < 2) return 'Company name must be at least 2 characters.'
    if (val.trim().length > 100) return 'Company name must be less than 100 characters.'
    return ''
  }

  function validateEmail(val) {
    if (!val || !val.trim()) return 'Email is required.'
    if (!val.includes('@')) return 'Email must contain @ symbol.'
    const parts = val.split('@')
    if (!parts[0]) return 'Enter username before @.'
    if (!parts[1] || !parts[1].includes('.')) return 'Enter valid domain like gmail.com'
    const validDomains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','company.com','co.in','org','net','edu']
    const domain = parts[1].toLowerCase()
    const valid = validDomains.some(d => domain === d || domain.endsWith('.' + d))
    if (!valid) return `Domain "${parts[1]}" not accepted.`
    return ''
  }

  function validatePassword(val) {
    if (!val) return 'Password is required.'
    if (val.length < 8) return 'Password must be at least 8 characters.'
    if (!/[A-Z]/.test(val)) return 'Must contain at least one uppercase letter.'
    if (!/[a-z]/.test(val)) return 'Must contain at least one lowercase letter.'
    if (!/[0-9]/.test(val)) return 'Must contain at least one number.'
    if (!/[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(val)) return 'Must contain at least one special character.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const nameErr  = validateCompanyName(companyName)
    const emailErr = validateEmail(email)
    const passErr  = validatePassword(password)
    const locErr   = !location.trim() ? 'Location is required.' : ''
    const indErr   = !industry ? 'Industry is required.' : ''

    if (nameErr || emailErr || passErr || locErr || indErr) {
      setErrors({ companyName: nameErr, email: emailErr, password: passErr, location: locErr, industry: indErr })
      return
    }

    setLoading(true)
    setServerErr('')

    try {
      const res = await registerCompany({ companyName, email, password, industry, location, website })
      if (!res.ok) {
        const err = await getFieldError(res)
        if (err.field) setErrors(p => ({ ...p, [err.field]: err.message }))
        else setServerErr(err.message)
        return
      }
      setSuccessMsg('Company registered! Please wait for admin approval.')
      setTimeout(() => navigate('/login'), 2500)
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
        <h2>Register Your Company</h2>

        {serverErr  && <div className="error-box">{serverErr}</div>}
        {successMsg && <div className="success-box">{successMsg}</div>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Company Name *</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)}
              placeholder="Acme Corp" className={errors.companyName ? 'input-error' : ''} />
            {errors.companyName && <span className="field-error">{errors.companyName}</span>}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="hr@company.com" className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 chars, uppercase, number, special char"
              className={errors.password ? 'input-error' : ''} />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Industry *</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)}
              className={errors.industry ? 'input-error' : ''}>
              <option value="">-- Select Industry --</option>
              <option>Information Technology</option>
              <option>Finance</option>
              <option>Healthcare</option>
              <option>Education</option>
              <option>E-commerce</option>
              <option>Manufacturing</option>
              <option>Other</option>
            </select>
            {errors.industry && <span className="field-error">{errors.industry}</span>}
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Bangalore" className={errors.location ? 'input-error' : ''} />
            {errors.location && <span className="field-error">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label>Website</label>
            <input value={website} onChange={e => setWebsite(e.target.value)}
              placeholder="https://company.com" />
          </div>

          <div className="info-box">
            ℹ️ After registration, admin will review and approve your account before you can login.
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register Company'}
          </button>
        </form>

        <div className="auth-links">
          <p>Already registered? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  )
}

export default CompanyRegister

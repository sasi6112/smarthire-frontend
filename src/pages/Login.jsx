import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginApi, getFieldError } from '../services/api'
import '../styles/forms.css'

function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [errors,    setErrors]    = useState({})
  const [serverErr, setServerErr] = useState('')
  const [loading,   setLoading]   = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) redirectUser(user.role)
  }, [user])

  // useEffect validates email whenever it changes
  useEffect(() => {
    if (email === '') return
    const timer = setTimeout(() => {
      const err = validateEmail(email)
      setErrors(prev => ({ ...prev, email: err }))
    }, 500)
    return () => clearTimeout(timer)
  }, [email])

  // useEffect validates password whenever it changes
  useEffect(() => {
    if (password === '') return
    const timer = setTimeout(() => {
      if (password.length < 1) {
        setErrors(prev => ({ ...prev, password: 'Password is required.' }))
      } else {
        setErrors(prev => ({ ...prev, password: '' }))
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [password])

  function validateEmail(val) {
    if (!val) return 'Email is required.'
    if (!val.includes('@')) return 'Email must contain @ symbol.'
    const parts = val.split('@')
    if (parts[0].length === 0) return 'Enter username before @.'
    if (!parts[1] || !parts[1].includes('.')) return 'Enter a valid domain like gmail.com'
    return ''
  }

  function redirectUser(role) {
    if (role === 'ROLE_ADMIN')   navigate('/admin/dashboard',   { replace: true })
    else if (role === 'ROLE_COMPANY') navigate('/company/dashboard', { replace: true })
    else navigate('/dashboard', { replace: true })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Final check before submit
    const emailErr = validateEmail(email)
    const passErr  = !password ? 'Password is required.' : ''
    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr })
      return
    }

    setLoading(true)
    setServerErr('')

    try {
      const res = await loginApi(email, password)
      if (!res.ok) {
        const err = await getFieldError(res)
        if (err.field) {
          setErrors(prev => ({ ...prev, [err.field]: err.message }))
        } else {
          setServerErr(err.message)
        }
        return
      }
      const data = await res.json()
      login(
        { id: data.id, name: data.name, companyName: data.companyName, email: data.email, role: data.role },
        data.accessToken,
        data.refreshToken
      )
      redirectUser(data.role)
    } catch (err) {
      setServerErr('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-logo">⚡ SmartHire</h1>
        <h2>Login to your account</h2>

        {serverErr && <div className="error-box">{serverErr}</div>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              placeholder="example@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <p>New user? <Link to="/register">Register here</Link></p>
          <p>Company? <Link to="/register/company">Register Company</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Login

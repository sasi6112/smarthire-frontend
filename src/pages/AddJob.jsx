import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { createJob, updateJob, getJobById, getFieldError, getErrorMessage } from '../services/api'
import '../styles/forms.css'

function AddJob() {
  const { id }   = useParams()
  const isEdit   = Boolean(id)
  const navigate = useNavigate()
  const { refreshAccessToken, logout } = useAuth()

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [location,    setLocation]    = useState('')
  const [salary,      setSalary]      = useState('')
  const [experience,  setExperience]  = useState('')
  const [technology,  setTechnology]  = useState('')
  const [industry,    setIndustry]    = useState('')
  const [openings,    setOpenings]    = useState('1')

  const [errors,    setErrors]    = useState({})
  const [serverErr, setServerErr] = useState('')
  const [loading,   setLoading]   = useState(false)

  // Load existing job if editing
  useEffect(() => {
    if (isEdit) {
      loadJob()
    }
  }, [id])

  // useEffect validates title
  useEffect(() => {
    if (!title) return
    const t = setTimeout(() => {
      if (title.trim().length < 3) {
        setErrors(p => ({ ...p, title: 'Job title must be at least 3 characters.' }))
      } else if (title.trim().length > 100) {
        setErrors(p => ({ ...p, title: 'Job title must be less than 100 characters.' }))
      } else {
        setErrors(p => ({ ...p, title: '' }))
      }
    }, 400)
    return () => clearTimeout(t)
  }, [title])

  // useEffect validates salary
  useEffect(() => {
    if (!salary) return
    const t = setTimeout(() => {
      const num = Number(salary)
      if (isNaN(num) || num <= 0) {
        setErrors(p => ({ ...p, salary: 'Salary must be a positive number.' }))
      } else if (num < 10000) {
        setErrors(p => ({ ...p, salary: 'Salary must be at least ₹10,000.' }))
      } else {
        setErrors(p => ({ ...p, salary: '' }))
      }
    }, 400)
    return () => clearTimeout(t)
  }, [salary])

  // useEffect validates location
  useEffect(() => {
    if (!location) return
    const t = setTimeout(() => {
      setErrors(p => ({ ...p, location: location.trim().length < 2 ? 'Location is required.' : '' }))
    }, 300)
    return () => clearTimeout(t)
  }, [location])

  async function loadJob() {
    try {
      const res = await getJobById(id, refreshAccessToken, logout)
      if (res.ok) {
        const job = await res.json()
        setTitle(job.title || '')
        setDescription(job.description || '')
        setLocation(job.location || '')
        setSalary(job.salary ? String(job.salary) : '')
        setExperience(job.experience || '')
        setTechnology(job.technology || '')
        setIndustry(job.industry || '')
        setOpenings(job.openings ? String(job.openings) : '1')
      }
    } catch (err) {
      setServerErr('Failed to load job details.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Validate all fields before submit
    const titleErr    = !title.trim() || title.trim().length < 3 ? 'Job title must be at least 3 characters.' : ''
    const locationErr = !location.trim() ? 'Location is required.' : ''
    const salaryNum   = Number(salary)
    const salaryErr   = !salary || isNaN(salaryNum) || salaryNum < 10000
                        ? 'Salary must be at least ₹10,000.' : ''
    const techErr     = !technology ? 'Technology is required.' : ''
    const expErr      = !experience ? 'Experience level is required.' : ''
    const indErr      = !industry   ? 'Industry is required.' : ''

    if (titleErr || locationErr || salaryErr || techErr || expErr || indErr) {
      setErrors({ title: titleErr, location: locationErr, salary: salaryErr,
                  technology: techErr, experience: expErr, industry: indErr })
      return
    }

    setLoading(true)
    setServerErr('')

    const jobData = {
      title:       title.trim(),
      description: description.trim(),
      location:    location.trim(),
      salary:      Number(salary),
      experience,
      technology,
      industry,
      openings:    Number(openings) || 1
    }

    try {
      const res = isEdit
        ? await updateJob(id, jobData, refreshAccessToken, logout)
        : await createJob(jobData, refreshAccessToken, logout)

      if (!res.ok) {
        const err = await getFieldError(res)
        if (err.field) setErrors(p => ({ ...p, [err.field]: err.message }))
        else setServerErr(err.message)
        return
      }
      navigate('/company/jobs')
    } catch (err) {
      setServerErr('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>{isEdit ? 'Edit Job' : 'Post New Job'}</h1>

        {serverErr && <div className="error-box">{serverErr}</div>}

        <div className="form-card">
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Job Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. React Developer"
                className={errors.title ? 'input-error' : ''} />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea rows={4} value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Job description, responsibilities, requirements..." />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Technology *</label>
                <select value={technology} onChange={e => setTechnology(e.target.value)}
                  className={errors.technology ? 'input-error' : ''}>
                  <option value="">-- Select --</option>
                  <option>React</option><option>Angular</option><option>Vue</option>
                  <option>Node.js</option><option>Java</option><option>Spring Boot</option>
                  <option>Python</option><option>Django</option><option>.NET</option>
                  <option>PHP</option><option>Go</option><option>Full Stack</option><option>Other</option>
                </select>
                {errors.technology && <span className="field-error">{errors.technology}</span>}
              </div>

              <div className="form-group">
                <label>Industry *</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)}
                  className={errors.industry ? 'input-error' : ''}>
                  <option value="">-- Select --</option>
                  <option>Information Technology</option><option>Finance</option>
                  <option>Healthcare</option><option>Education</option>
                  <option>E-commerce</option><option>Manufacturing</option><option>Other</option>
                </select>
                {errors.industry && <span className="field-error">{errors.industry}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Experience Level *</label>
                <select value={experience} onChange={e => setExperience(e.target.value)}
                  className={errors.experience ? 'input-error' : ''}>
                  <option value="">-- Select --</option>
                  <option>Fresher</option><option>1-2 years</option>
                  <option>2-5 years</option><option>5+ years</option>
                </select>
                {errors.experience && <span className="field-error">{errors.experience}</span>}
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className={errors.location ? 'input-error' : ''} />
                {errors.location && <span className="field-error">{errors.location}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Annual Salary (₹) *</label>
                <input type="number" value={salary} onChange={e => setSalary(e.target.value)}
                  placeholder="e.g. 600000 (min 10000)"
                  className={errors.salary ? 'input-error' : ''} />
                {errors.salary && <span className="field-error">{errors.salary}</span>}
              </div>

              <div className="form-group">
                <label>Openings</label>
                <input type="number" value={openings}
                  onChange={e => setOpenings(e.target.value)}
                  min="1" placeholder="1" />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline"
                onClick={() => navigate('/company/jobs')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (isEdit ? 'Update Job' : 'Post Job')}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default AddJob

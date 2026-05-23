import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import JobCard from '../components/JobCard'
import { getAllJobs, getCompanyJobs, applyForJob, deleteJob, getMyApplications, getErrorMessage } from '../services/api'
import '../styles/jobs.css'

function Jobs() {
  const { user, refreshAccessToken, logout } = useAuth()
  const navigate   = useNavigate()
  const isCompany  = user && user.role === 'ROLE_COMPANY'

  const [jobs,       setJobs]       = useState([])
  const [appliedIds, setAppliedIds] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [errorMsg,   setErrorMsg]   = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [search,     setSearch]     = useState('')

  const [technology, setTechnology] = useState('')
  const [experience, setExperience] = useState('')
  const [industry,   setIndustry]   = useState('')
  const [location,   setLocation]   = useState('')
  const [salary,     setSalary]     = useState('')

  useEffect(() => {
    loadJobs()
    if (!isCompany) loadAppliedIds()
  }, [])

  async function loadJobs() {
    setLoading(true)
    try {
      const res = isCompany
        ? await getCompanyJobs(refreshAccessToken, logout)
        : await getAllJobs({ technology, experience, industry, location, salary }, refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      setJobs(await res.json())
    } catch (err) {
      setErrorMsg('Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }

  async function loadAppliedIds() {
    try {
      const res = await getMyApplications(refreshAccessToken, logout)
      if (res.ok) {
        const data = await res.json()
        setAppliedIds(data.map(a => a.jobId))
      }
    } catch (err) { /* silent */ }
  }

  async function handleApply(jobId) {
    try {
      const res = await applyForJob(jobId, refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      setAppliedIds(prev => [...prev, jobId])
      setSuccessMsg('Application submitted successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) { setErrorMsg('Failed to apply.') }
  }

  async function handleDelete(jobId) {
    if (!window.confirm('Delete this job?')) return
    try {
      const res = await deleteJob(jobId, refreshAccessToken, logout)
      if (!res.ok) { setErrorMsg(await getErrorMessage(res)); return }
      setJobs(jobs.filter(j => j.id !== jobId))
      setSuccessMsg('Job deleted.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) { setErrorMsg('Failed to delete.') }
  }

  const filtered = jobs.filter(job => {
    // 1. Search text filter
    if (search) {
      const s = search.toLowerCase()
      const matchesSearch = (
        (job.title       && job.title.toLowerCase().includes(s)) ||
        (job.companyName && job.companyName.toLowerCase().includes(s)) ||
        (job.technology  && job.technology.toLowerCase().includes(s)) ||
        (job.location    && job.location.toLowerCase().includes(s)) ||
        (job.description && job.description.toLowerCase().includes(s))
      )
      if (!matchesSearch) return false
    }

    // 2. Technology filter (case-insensitive)
    if (technology && (!job.technology || job.technology.toLowerCase().trim() !== technology.toLowerCase().trim())) {
      return false
    }

    // 3. Experience filter (case-insensitive)
    if (experience && (!job.experience || job.experience.toLowerCase().trim() !== experience.toLowerCase().trim())) {
      return false
    }

    // 4. Industry filter (case-insensitive)
    if (industry && (!job.industry || job.industry.toLowerCase().trim() !== industry.toLowerCase().trim())) {
      return false
    }

    // 5. Location filter (case-insensitive)
    if (location && (!job.location || job.location.toLowerCase().trim() !== location.toLowerCase().trim())) {
      return false
    }

    // 6. Salary filter (numeric range verification)
    if (salary) {
      const [min, max] = salary.split('-').map(Number)
      const jobSalary = Number(job.salary)
      if (isNaN(jobSalary) || jobSalary < min || jobSalary > max) {
        return false
      }
    }

    return true
  })

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header-row">
          <h1>{isCompany ? 'My Job Posts' : 'Browse Jobs'}</h1>
          {isCompany && (
            <button className="btn btn-primary" onClick={() => navigate('/company/add-job')}>
              + Post New Job
            </button>
          )}
        </div>

        {errorMsg   && <div className="error-box">{errorMsg}</div>}
        {successMsg && <div className="success-box">{successMsg}</div>}

        {!isCompany && (
          <div className="filters-box">
            <input className="search-input" placeholder="Search by title, company, tech, location..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <div className="filter-row">
              <select value={technology} onChange={e => setTechnology(e.target.value)}>
                <option value="">All Technologies</option>
                <option>React</option><option>Angular</option><option>Vue</option>
                <option>Node.js</option><option>Java</option><option>Spring Boot</option>
                <option>Python</option><option>Django</option><option>.NET</option>
                <option>PHP</option><option>Go</option><option>Full Stack</option>
              </select>
              <select value={experience} onChange={e => setExperience(e.target.value)}>
                <option value="">All Experience</option>
                <option>Fresher</option><option>1-2 years</option>
                <option>2-5 years</option><option>5+ years</option>
              </select>
              <select value={industry} onChange={e => setIndustry(e.target.value)}>
                <option value="">All Industries</option>
                <option>Information Technology</option><option>Finance</option>
                <option>Healthcare</option><option>Education</option>
                <option>E-commerce</option><option>Manufacturing</option>
              </select>
              <select value={location} onChange={e => setLocation(e.target.value)}>
                <option value="">All Locations</option>
                <option>Bangalore</option><option>Mumbai</option><option>Delhi</option>
                <option>Hyderabad</option><option>Chennai</option><option>Pune</option><option>Remote</option>
              </select>
              <select value={salary} onChange={e => setSalary(e.target.value)}>
                <option value="">All Salaries</option>
                <option value="0-300000">0 - 3 LPA</option>
                <option value="300000-600000">3 - 6 LPA</option>
                <option value="600000-1000000">6 - 10 LPA</option>
                <option value="1000000-1500000">10 - 15 LPA</option>
                <option value="1500000-9999999">15+ LPA</option>
              </select>
              <button className="btn btn-primary" onClick={loadJobs}>Search</button>
              <button className="btn btn-outline" onClick={async () => {
                setTechnology('')
                setExperience('')
                setIndustry('')
                setLocation('')
                setSalary('')
                setSearch('')
                setLoading(true)
                try {
                  const res = await getAllJobs({ technology: '', experience: '', industry: '', location: '', salary: '' }, refreshAccessToken, logout)
                  if (res.ok) {
                    setJobs(await res.json())
                  }
                } catch (err) {
                  setErrorMsg('Failed to reset jobs.')
                } finally {
                  setLoading(false)
                }
              }}>Clear</button>
            </div>
          </div>
        )}

        {loading && <p className="loading-text">Loading jobs...</p>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state"><p>No jobs found.</p></div>
        )}

        <div className="jobs-grid">
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              userRole={user.role}
              hasApplied={appliedIds.includes(job.id)}
              onApply={handleApply}
              onEdit={id => navigate(`/company/edit-job/${id}`)}
              onDelete={handleDelete}
              onViewApplicants={id => navigate(`/company/applicants/${id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Jobs

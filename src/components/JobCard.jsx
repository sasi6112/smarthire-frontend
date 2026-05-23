import React from 'react'
import '../styles/jobs.css'

function JobCard({ job, userRole, hasApplied, onApply, onEdit, onDelete, onViewApplicants }) {
  return (
    <div className="job-card">
      <div className="job-card-top">
        <div>
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{job.companyName}</p>
        </div>
        <span className="job-industry">{job.industry}</span>
      </div>

      <div className="job-tags">
        <span>📍 {job.location}</span>
        <span>💰 ₹{job.salary ? job.salary.toLocaleString() : 'N/A'}</span>
        <span>⏳ {job.experience}</span>
        <span>💻 {job.technology}</span>
      </div>

      {job.description && (
        <p className="job-desc">{job.description}</p>
      )}

      <div className="job-card-footer">
        {userRole === 'ROLE_USER' && (
          <button
            className={hasApplied ? 'btn btn-applied' : 'btn btn-primary'}
            onClick={() => !hasApplied && onApply(job.id)}
            disabled={hasApplied}
          >
            {hasApplied ? '✓ Applied' : 'Apply Now'}
          </button>
        )}

        {userRole === 'ROLE_COMPANY' && (
          <div className="company-job-actions">
            <button className="btn btn-secondary" onClick={() => onEdit(job.id)}>Edit</button>
            <button className="btn btn-danger"    onClick={() => onDelete(job.id)}>Delete</button>
            <button className="btn btn-primary"   onClick={() => onViewApplicants(job.id)}>
              View Applicants
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobCard

// All API URLs come from environment variable - never hardcoded
// .env file has: VITE_API_URL=http://localhost:8080
const API_URL = import.meta.env.VITE_API_URL

// ── Helper: add JWT token to every request ───────────────────────
// If 401 (token expired) → get new token → retry once
async function authRequest(url, options, refreshFn, logoutFn) {
  const token = localStorage.getItem('accessToken')
  const headers = { ...options.headers, 'Authorization': 'Bearer ' + token }
  let response = await fetch(url, { ...options, headers })

  // Token expired - try refresh
  if (response.status === 401 && refreshFn) {
    const newToken = await refreshFn()
    if (newToken) {
      headers['Authorization'] = 'Bearer ' + newToken
      response = await fetch(url, { ...options, headers })
    } else {
      logoutFn && logoutFn()
    }
  }
  return response
}

// ── Helper: read error message from backend response ─────────────
export async function getErrorMessage(response) {
  try {
    const data = await response.json()
    return data.message || 'Something went wrong.'
  } catch (e) {
    return 'Something went wrong.'
  }
}

// ── Helper: read field name from validation error ─────────────────
export async function getFieldError(response) {
  try {
    const data = await response.json()
    return { field: data.field || null, message: data.message || 'Something went wrong.' }
  } catch (e) {
    return { field: null, message: 'Something went wrong.' }
  }
}

// ── AUTH ──────────────────────────────────────────────────────────
export function registerUser(formData) {
  return fetch(`${API_URL}/api/auth/register/user`, { method: 'POST', body: formData })
}

export function registerCompany(data) {
  return fetch(`${API_URL}/api/auth/register/company`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

export function loginApi(email, password) {
  return fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
}

// ── JOBS ──────────────────────────────────────────────────────────
export function getAllJobs(filters, refreshFn, logoutFn) {
  const params = new URLSearchParams()
  if (filters.technology) params.append('technology', filters.technology)
  if (filters.experience)  params.append('experience',  filters.experience)
  if (filters.industry)    params.append('industry',    filters.industry)
  if (filters.location)    params.append('location',    filters.location)
  if (filters.salary)      params.append('salary',      filters.salary)
  const query = params.toString()
  return authRequest(`${API_URL}/api/jobs${query ? '?' + query : ''}`,
    { method: 'GET' }, refreshFn, logoutFn)
}

export function getJobById(jobId, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/jobs/${jobId}`, { method: 'GET' }, refreshFn, logoutFn)
}

export function getCompanyJobs(refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/company/jobs`, { method: 'GET' }, refreshFn, logoutFn)
}

export function createJob(data, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/company/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, refreshFn, logoutFn)
}

export function updateJob(jobId, data, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/company/jobs/${jobId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, refreshFn, logoutFn)
}

export function deleteJob(jobId, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/company/jobs/${jobId}`,
    { method: 'DELETE' }, refreshFn, logoutFn)
}

// ── APPLICATIONS ──────────────────────────────────────────────────
export function applyForJob(jobId, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/user/apply/${jobId}`,
    { method: 'POST' }, refreshFn, logoutFn)
}

export function getMyApplications(refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/user/applications`,
    { method: 'GET' }, refreshFn, logoutFn)
}

export function getApplicants(jobId, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/company/jobs/${jobId}/applicants`,
    { method: 'GET' }, refreshFn, logoutFn)
}

export function updateApplicationStatus(appId, status, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/company/applications/${appId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }, refreshFn, logoutFn)
}

// ── PROFILE ───────────────────────────────────────────────────────
export function getUserProfile(refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/user/profile`, { method: 'GET' }, refreshFn, logoutFn)
}

export function updateUserProfile(formData, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/user/profile`,
    { method: 'PUT', body: formData }, refreshFn, logoutFn)
}

export function updateResume(formData, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/user/profile/resume`,
    { method: 'PUT', body: formData }, refreshFn, logoutFn)
}

export function deleteResume(refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/user/profile/resume`,
    { method: 'DELETE' }, refreshFn, logoutFn)
}

export function uploadProfilePicture(formData, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/user/profile/picture`,
    { method: 'PUT', body: formData }, refreshFn, logoutFn)
}

export function deleteProfilePicture(refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/user/profile/picture`,
    { method: 'DELETE' }, refreshFn, logoutFn)
}

// ── ADMIN ─────────────────────────────────────────────────────────
export function getPendingCompanies(refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/admin/companies/pending`,
    { method: 'GET' }, refreshFn, logoutFn)
}

export function getAllCompanies(refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/admin/companies`,
    { method: 'GET' }, refreshFn, logoutFn)
}

export function approveCompany(id, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/admin/companies/${id}/approve`,
    { method: 'PUT' }, refreshFn, logoutFn)
}

export function rejectCompany(id, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/admin/companies/${id}/reject`,
    { method: 'PUT' }, refreshFn, logoutFn)
}

export function blockCompany(id, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/admin/companies/${id}/block`,
    { method: 'PUT' }, refreshFn, logoutFn)
}

export function unblockCompany(id, refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/admin/companies/${id}/unblock`,
    { method: 'PUT' }, refreshFn, logoutFn)
}

export function getAllJobsAdmin(refreshFn, logoutFn) {
  return authRequest(`${API_URL}/api/admin/jobs`,
    { method: 'GET' }, refreshFn, logoutFn)
}

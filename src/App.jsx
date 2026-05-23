import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import Login           from './pages/Login'
import Register        from './pages/Register'
import CompanyRegister from './pages/CompanyRegister'
import Dashboard       from './pages/Dashboard'
import Jobs            from './pages/Jobs'
import AppliedJobs     from './pages/AppliedJobs'
import AddJob          from './pages/AddJob'
import Applicants      from './pages/Applicants'
import CompanyApproval from './pages/CompanyApproval'
import AdminDashboard  from './pages/AdminDashboard'
import UserProfile     from './pages/UserProfile'
import ProtectedRoute  from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/"                 element={<Navigate to="/login" replace />} />
          <Route path="/login"            element={<Login />} />
          <Route path="/register"         element={<Register />} />
          <Route path="/register/company" element={<CompanyRegister />} />

          {/* USER routes */}
          <Route element={<ProtectedRoute allowedRole="ROLE_USER" />}>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/jobs"         element={<Jobs />} />
            <Route path="/applied-jobs" element={<AppliedJobs />} />
            <Route path="/profile"      element={<UserProfile />} />
          </Route>

          {/* COMPANY routes */}
          <Route element={<ProtectedRoute allowedRole="ROLE_COMPANY" />}>
            <Route path="/company/dashboard"         element={<Dashboard />} />
            <Route path="/company/jobs"              element={<Jobs />} />
            <Route path="/company/add-job"           element={<AddJob />} />
            <Route path="/company/edit-job/:id"      element={<AddJob />} />
            <Route path="/company/applicants/:jobId" element={<Applicants />} />
          </Route>

          {/* ADMIN routes */}
          <Route element={<ProtectedRoute allowedRole="ROLE_ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/companies" element={<CompanyApproval />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

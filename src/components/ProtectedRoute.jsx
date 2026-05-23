import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ allowedRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'ROLE_ADMIN')   return <Navigate to="/admin/dashboard"   replace />
    if (user.role === 'ROLE_COMPANY') return <Navigate to="/company/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

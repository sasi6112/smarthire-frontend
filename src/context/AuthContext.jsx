import React, { createContext, useContext, useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL

const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser  = localStorage.getItem('user')
    const savedToken = localStorage.getItem('accessToken')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  function login(userData, accessToken, refreshToken) {
    localStorage.setItem('accessToken',  accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user',         JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  function getAccessToken()  { return localStorage.getItem('accessToken') }
  function getRefreshToken() { return localStorage.getItem('refreshToken') }

  async function refreshAccessToken() {
    const refreshToken = getRefreshToken()
    if (!refreshToken) { logout(); return null }
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken })
      })
      if (!res.ok) { logout(); return null }
      const data = await res.json()
      localStorage.setItem('accessToken', data.accessToken)
      return data.accessToken
    } catch (err) {
      logout()
      return null
    }
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout, loading,
      getAccessToken, getRefreshToken, refreshAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

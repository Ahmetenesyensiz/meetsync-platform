import { useState, useEffect } from 'react'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('ms_token'))
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('ms_user')
    return u ? JSON.parse(u) : null
  })

  const login = (data) => {
    localStorage.setItem('ms_token', data.accessToken)
    localStorage.setItem('ms_user', JSON.stringify({
      email: data.email,
      fullName: data.fullName,
      role: data.role
    }))
    setToken(data.accessToken)
    setUser({ email: data.email, fullName: data.fullName, role: data.role })
  }

  const logout = () => {
    localStorage.removeItem('ms_token')
    localStorage.removeItem('ms_user')
    setToken(null)
    setUser(null)
  }

  return { token, user, login, logout }
}

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    const userData = {
      token: data.token,
      username: data.username,
      role: data.role,
      userId: data.userId,
      profileId: data.profileId,
      name: data.name
    }
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', data.token)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

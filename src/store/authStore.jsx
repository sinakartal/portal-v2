import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('bringo_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('bringo_user')
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    // Mock login
    const mockUsers = {
      'admin@bringo.com': { _id: '1', email: 'admin@bringo.com', firstName: 'Admin', lastName: 'User', role: 'super_admin', permissions: ['*'] },
      'manager@bringo.com': { _id: '2', email: 'manager@bringo.com', firstName: 'Manager', lastName: 'User', role: 'manager', permissions: ['orders:read', 'orders:create', 'orders:update', 'orders:assign', 'orders:bulk_import', 'couriers:read', 'couriers:track', 'routes:read', 'routes:create', 'routes:optimize', 'analytics:read', 'analytics:export', 'finance:read'] },
      'dispatcher@bringo.com': { _id: '4', email: 'dispatcher@bringo.com', firstName: 'Dispatcher', lastName: 'User', role: 'dispatcher', permissions: ['orders:read', 'orders:create', 'orders:update', 'orders:assign', 'couriers:read', 'couriers:track', 'routes:read', 'routes:create'] },
      'operator@bringo.com': { _id: '3', email: 'operator@bringo.com', firstName: 'Operator', lastName: 'User', role: 'operator', permissions: ['orders:read', 'orders:create', 'orders:update', 'couriers:read', 'couriers:track'] },
    }

    const foundUser = mockUsers[email]
    if (foundUser && password === '123456') {
      const mockToken = 'mock_token_' + Date.now()
      setUser(foundUser)
      setToken(mockToken)
      localStorage.setItem('bringo_token', mockToken)
      localStorage.setItem('bringo_user', JSON.stringify(foundUser))
      return { success: true }
    }
    return { success: false, message: 'E-posta veya sifre hatali' }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('bringo_token')
    localStorage.removeItem('bringo_user')
  }

  const hasPermission = (permission) => {
    if (!user) return false
    if (user.permissions.includes('*')) return true
    return user.permissions.includes(permission)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('bringo_token'))
  const loading = ref(true)

  // Initialize from localStorage
  const savedUser = localStorage.getItem('bringo_user')
  if (savedUser && token.value) {
    user.value = JSON.parse(savedUser)
  }
  loading.value = false

  const mockUsers = {
    'sina': { _id: '1', email: 'sina@bringo.com', firstName: 'Sina', lastName: 'Kartal', role: 'super_admin', permissions: ['*'] },
    'admin@bringo.com': { _id: '1', email: 'sina@bringo.com', firstName: 'Sina', lastName: 'Kartal', role: 'super_admin', permissions: ['*'] },
    'manager@bringo.com': { _id: '2', email: 'manager@bringo.com', firstName: 'Manager', lastName: 'User', role: 'manager', permissions: ['orders:read', 'orders:create', 'orders:update', 'orders:assign', 'orders:bulk_import', 'couriers:read', 'couriers:track', 'routes:read', 'routes:create', 'routes:optimize', 'analytics:read', 'analytics:export', 'finance:read'] },
    'dispatcher@bringo.com': { _id: '4', email: 'dispatcher@bringo.com', firstName: 'Dispatcher', lastName: 'User', role: 'dispatcher', permissions: ['orders:read', 'orders:create', 'orders:update', 'orders:assign', 'couriers:read', 'couriers:track', 'routes:read', 'routes:create'] },
    'operator@bringo.com': { _id: '3', email: 'operator@bringo.com', firstName: 'Operator', lastName: 'User', role: 'operator', permissions: ['orders:read', 'orders:create', 'orders:update', 'couriers:read', 'couriers:track'] },
  }

  async function login(identifier, password) {
    const foundUser = mockUsers[identifier]
    if (foundUser && password === '123456') {
      const mockToken = 'mock_token_' + Date.now()
      user.value = foundUser
      token.value = mockToken
      localStorage.setItem('bringo_token', mockToken)
      localStorage.setItem('bringo_user', JSON.stringify(foundUser))
      return { success: true }
    }
    return { success: false, message: 'E-posta veya sifre hatali' }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('bringo_token')
    localStorage.removeItem('bringo_user')
  }

  function hasPermission(permission) {
    if (!user.value) return false
    if (user.value.permissions.includes('*')) return true
    return user.value.permissions.includes(permission)
  }

  return { user, token, loading, login, logout, hasPermission }
})

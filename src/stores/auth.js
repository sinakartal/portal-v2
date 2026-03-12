import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const PORTAL = '/portal-api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('bringo_token'))
  const loading = ref(true)
  const impersonating = ref(localStorage.getItem('bringo_impersonate_tenant') || null)
  const impersonateName = ref(localStorage.getItem('bringo_impersonate_name') || null)

  // Initialize from localStorage
  const savedUser = localStorage.getItem('bringo_user')
  if (savedUser && token.value) {
    user.value = JSON.parse(savedUser)
  }
  loading.value = false

  // Mock users (fallback when backend is unavailable)
  const mockUsers = {
    'sina': { _id: '1', email: 'sina@bringo.com', firstName: 'Sina', lastName: 'Kartal', role: 'super_admin', permissions: ['*'] },
    'admin@bringo.com': { _id: '1', email: 'sina@bringo.com', firstName: 'Sina', lastName: 'Kartal', role: 'super_admin', permissions: ['*'] },
    'manager@bringo.com': { _id: '2', email: 'manager@bringo.com', firstName: 'Manager', lastName: 'User', role: 'manager', permissions: ['orders:read', 'orders:create', 'orders:update', 'orders:assign', 'orders:bulk_import', 'couriers:read', 'couriers:track', 'routes:read', 'routes:create', 'routes:optimize', 'analytics:read', 'analytics:export', 'finance:read'] },
    'dispatcher@bringo.com': { _id: '4', email: 'dispatcher@bringo.com', firstName: 'Dispatcher', lastName: 'User', role: 'dispatcher', permissions: ['orders:read', 'orders:create', 'orders:update', 'orders:assign', 'couriers:read', 'couriers:track', 'routes:read', 'routes:create'] },
    'operator@bringo.com': { _id: '3', email: 'operator@bringo.com', firstName: 'Operator', lastName: 'User', role: 'operator', permissions: ['orders:read', 'orders:create', 'orders:update', 'couriers:read', 'couriers:track'] },
  }

  async function login(identifier, password) {
    // Try backend first
    try {
      const res = await fetch(`${PORTAL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.token && data.user) {
          user.value = data.user
          token.value = data.token
          localStorage.setItem('bringo_token', data.token)
          localStorage.setItem('bringo_user', JSON.stringify(data.user))
          return { success: true }
        }
      }
    } catch (e) {
      console.warn('[Auth] Backend unavailable, using mock login')
    }

    // Fallback to mock login
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

  async function verifyToken() {
    if (!token.value) return false
    // Skip verification for mock tokens
    if (token.value.startsWith('mock_token_')) return !!user.value
    try {
      const res = await fetch(`${PORTAL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token.value}` },
      })
      if (res.ok) {
        const data = await res.json()
        user.value = data.user || data
        localStorage.setItem('bringo_user', JSON.stringify(user.value))
        return true
      }
    } catch (e) {
      console.warn('[Auth] Token verify failed:', e.message)
    }
    return !!user.value
  }

  function logout() {
    user.value = null
    token.value = null
    impersonating.value = null
    impersonateName.value = null
    localStorage.removeItem('bringo_token')
    localStorage.removeItem('bringo_user')
    localStorage.removeItem('bringo_impersonate_tenant')
    localStorage.removeItem('bringo_impersonate_name')
  }

  function startImpersonation(projectId, name) {
    impersonating.value = projectId
    impersonateName.value = name
    localStorage.setItem('bringo_impersonate_tenant', projectId)
    localStorage.setItem('bringo_impersonate_name', name)
  }

  function stopImpersonation() {
    impersonating.value = null
    impersonateName.value = null
    localStorage.removeItem('bringo_impersonate_tenant')
    localStorage.removeItem('bringo_impersonate_name')
  }

  function hasPermission(permission) {
    if (!user.value) return false
    if (user.value.permissions.includes('*')) return true
    return user.value.permissions.includes(permission)
  }

  const activeProjectId = computed(() => impersonating.value || null)

  return {
    user, token, loading,
    impersonating, impersonateName, activeProjectId,
    login, logout, verifyToken,
    startImpersonation, stopImpersonation,
    hasPermission,
  }
})

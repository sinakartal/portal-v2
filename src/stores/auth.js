import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const PORTAL = '/portal-api'

// Sadece VITE_DEV_MOCK=true ise mock kullanılır
const DEV_MOCK_ENABLED = import.meta.env.VITE_DEV_MOCK === 'true'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('bringo_token'))
  const loading = ref(true)
  const impersonating = ref(localStorage.getItem('bringo_impersonate_tenant') || null)
  const impersonateName = ref(localStorage.getItem('bringo_impersonate_name') || null)

  // Initialize from localStorage — sadece onbellek, verifyToken ile dogrulanacak
  const savedUser = localStorage.getItem('bringo_user')
  if (savedUser && token.value) {
    try { user.value = JSON.parse(savedUser) } catch (_) {}
  }
  loading.value = false

  // Mock kullanicilar — SADECE DEV_MOCK_ENABLED=true iken
  const mockUsers = {
    'sina@bringo.com':       { _id: '1', email: 'sina@bringo.com', firstName: 'Sina', lastName: 'Kartal', role: 'super_admin', permissions: ['*'] },
    'admin@bringo.com':      { _id: '1', email: 'admin@bringo.com', firstName: 'Admin', lastName: 'Bringo', role: 'super_admin', permissions: ['*'] },
    'manager@bringo.com':    { _id: '2', email: 'manager@bringo.com', firstName: 'Manager', lastName: 'User', role: 'manager', permissions: ['orders:read','orders:create','orders:update','orders:assign','orders:bulk_import','couriers:read','couriers:track','routes:read','routes:create','routes:optimize','analytics:read','analytics:export','finance:read'] },
    'dispatcher@bringo.com': { _id: '4', email: 'dispatcher@bringo.com', firstName: 'Dispatcher', lastName: 'User', role: 'dispatcher', permissions: ['orders:read','orders:create','orders:update','orders:assign','couriers:read','couriers:track','routes:read','routes:create'] },
    'operator@bringo.com':   { _id: '3', email: 'operator@bringo.com', firstName: 'Operator', lastName: 'User', role: 'operator', permissions: ['orders:read','orders:create','orders:update','couriers:read','couriers:track'] },
    'sina':                  { _id: '1', email: 'sina@bringo.com', firstName: 'Sina', lastName: 'Kartal', role: 'super_admin', permissions: ['*'] },
  }

  async function login(identifier, password) {
    // 1. Gercek backend dene
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
      // Backend cevap verdi ama basarisiz — mock'a dusme
      if (res.status === 401) {
        return { success: false, message: 'E-posta veya sifre hatali' }
      }
    } catch (e) {
      // Backend ulasilamaz
      if (!DEV_MOCK_ENABLED) {
        return { success: false, message: 'Sunucuya baglanamadi. Lutfen tekrar deneyin.' }
      }
      console.warn('[Auth] Backend unavailable, DEV_MOCK_ENABLED aktif — mock login kullaniliyor')
    }

    // 2. Mock fallback — SADECE DEV_MOCK_ENABLED=true iken
    if (DEV_MOCK_ENABLED) {
      const foundUser = mockUsers[identifier]
      if (foundUser && password === '123456') {
        const mockToken = 'brg_dev_' + Date.now()
        user.value = foundUser
        token.value = mockToken
        localStorage.setItem('bringo_token', mockToken)
        localStorage.setItem('bringo_user', JSON.stringify(foundUser))
        console.warn('[Auth] DEV MOCK LOGIN — bu mod production\'da devre disi')
        return { success: true }
      }
      return { success: false, message: 'E-posta veya sifre hatali' }
    }

    return { success: false, message: 'Giris basarisiz' }
  }

  async function verifyToken() {
    if (!token.value) return false

    // DEV mock token — backend'e gitme, sadece user var mi kontrol et
    if (DEV_MOCK_ENABLED && token.value.startsWith('brg_dev_')) {
      return !!user.value
    }

    // Eski mock token varsa temizle, tekrar login iste
    if (token.value.startsWith('mock_token_')) {
      console.warn('[Auth] Eski mock_token_ bulundu, temizleniyor')
      logout()
      return false
    }

    // Gercek token — backend'de dogrula
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
      // Token gecersiz veya suresi dolmus
      if (res.status === 401) {
        logout()
        return false
      }
    } catch (e) {
      console.warn('[Auth] Token verify failed:', e.message)
      // Network hatasi — onbellekteki kullaniciyla devam et (offline tolerance)
      return !!user.value
    }
    return false
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
    if (user.value.permissions?.includes('*')) return true
    return user.value.permissions?.includes(permission) ?? false
  }

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const activeProjectId = computed(() => impersonating.value || null)

  return {
    user, token, loading, isAuthenticated,
    impersonating, impersonateName, activeProjectId,
    login, logout, verifyToken,
    startImpersonation, stopImpersonation,
    hasPermission,
  }
})

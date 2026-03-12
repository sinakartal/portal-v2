import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { portalClient } from '../api/portal-client'
import type { AuthState } from '../types'

interface AuthContextType extends AuthState {
  loginAsMerchant: (apiKey: string) => Promise<{ success: boolean; error?: string }>
  loginAsAdmin: (adminKey: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
  })

  const loginAsMerchant = useCallback(async (apiKey: string) => {
    const result = await portalClient.validateTenantKey(apiKey)
    if (result.success) {
      setAuth({
        isAuthenticated: true,
        role: 'merchant',
        apiKey,
        tenant: result.data as any,
      })
      return { success: true }
    }
    return { success: false, error: result.error || 'Invalid API key' }
  }, [])

  const loginAsAdmin = useCallback(async (adminKey: string) => {
    const result = await portalClient.validateAdminKey(adminKey)
    if (result.success) {
      setAuth({ isAuthenticated: true, role: 'admin', adminKey })
      return { success: true }
    }
    return { success: false, error: result.error || 'Invalid admin key' }
  }, [])

  const logout = useCallback(() => {
    portalClient.clearAuth()
    setAuth({ isAuthenticated: false, role: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, loginAsMerchant, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

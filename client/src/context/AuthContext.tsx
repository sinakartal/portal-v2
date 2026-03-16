import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { portalClient } from '../api/portal-client'
import type { AuthState } from '../types'

interface AuthContextType extends AuthState {
  loginAsMerchant: (apiKey: string) => Promise<{ success: boolean; error?: string }>
  loginAsAdmin: (adminKey: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  logoUrl: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

function applyBranding(config: any) {
  if (!config) return
  const root = document.documentElement
  if (config.primaryColor) {
    root.style.setProperty('--accent', config.primaryColor)
    root.style.setProperty('--accent-hover', config.primaryColor + 'dd')
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
  })
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const loginAsMerchant = useCallback(async (apiKey: string) => {
    const result = await portalClient.validateTenantKey(apiKey)
    if (result.success) {
      setAuth({
        isAuthenticated: true,
        role: 'merchant',
        apiKey,
        tenant: result.data as any,
      })

      // Tenant branding uygula
      try {
        const configRes = await portalClient.getTenantConfig()
        if (configRes.success && configRes.data) {
          applyBranding(configRes.data)
          if (configRes.data.logoUrl) {
            setLogoUrl(configRes.data.logoUrl)
          }
        }
      } catch {
        // Branding opsiyonel — hata olursa sessizce devam et
      }

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
    setLogoUrl(null)
    // Branding'i sifirla
    document.documentElement.style.removeProperty('--accent')
    document.documentElement.style.removeProperty('--accent-hover')
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, loginAsMerchant, loginAsAdmin, logout, logoUrl }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

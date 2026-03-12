export type TenantTier = 'starter' | 'growth' | 'enterprise'

export type OrderStatus = 'pending' | 'dispatched' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'

export interface Tenant {
  projectId: string
  projectName: string
  tier: TenantTier
  contactEmail: string
  apiKeyPrefix?: string
  apiKeyRevoked?: boolean
  webhookConfigured?: boolean
  createdAt: number
  updatedAt: number
}

export interface TenantConfig {
  projectId: string
  projectName: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  contactEmail: string
  contactPhone: string
  webhookUrl: string | null
  webhookSecret: string | null
  webhookEvents: string[]
  apiTier: TenantTier
  checkoutWidgetEnabled: boolean
  trackingPageEnabled: boolean
  onboardingStatus: {
    apiKeyCreated: boolean
    firstOrderSent: boolean
    webhookConfigured: boolean
    firstDeliveryCompleted: boolean
  }
  createdAt: number
  updatedAt: number
}

export interface Order {
  orderId: string
  externalOrderId: string
  status: OrderStatus
  mode: 'instant' | 'standard' | 'flex'
  origin?: { id: string; name: string; location?: LatLng }
  delivery?: { location: LatLng; customerName: string; address?: string }
  courier?: { name: string; phone: string; location?: LatLng | null }
  trackingUrl?: string
  estimatedDelivery?: string
  createdAt: string
  pricing?: { basePrice: number; discount: number; total: number }
  timeline?: TimelineEvent[]
}

export interface TimelineEvent {
  event: string
  label: string
  timestamp: string | null
  completed: boolean
  active: boolean
  details?: Record<string, any>
}

export interface LatLng {
  lat: number
  lng: number
}

export interface KPIData {
  orders: { total: number; pending: number; dispatched: number; delivered: number; cancelled: number }
  routes: { total: number; active: number; completed: number; totalKm: number }
  sla: { percent: number; target: number; isAboveTarget: boolean; breached: number; warning: number }
  couriers: { total: number; idle: number; busy: number }
}

export interface AdminOverview {
  totalTenants: number
  activeApiKeys: number
  totalOrders: number
  totalDeliveries: number
  avgSLA: number
}

export interface TrackingData {
  orderId: string
  status: string
  statusLabel: string
  timeline: TimelineEvent[]
  courier: { name: string; phone: string; location: LatLng | null } | null
  estimatedDelivery: string | null
  branding: {
    projectName: string
    logoUrl: string | null
    primaryColor: string
    secondaryColor: string
  }
}

export interface WebhookLog {
  id: string
  event: string
  webhookId: string
  timestamp: number
  result: { success: boolean; statusCode: number | null; duration: number; mock: boolean; error?: string }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface AuthState {
  isAuthenticated: boolean
  role: 'admin' | 'merchant' | null
  tenant?: { projectId: string; projectName: string; tier: TenantTier; isTest: boolean }
  apiKey?: string
  adminKey?: string
}

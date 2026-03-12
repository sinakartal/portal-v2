/**
 * Portal-specific type definitions.
 * Algoritma types are NOT imported — Portal remains independent.
 */

// ─── Tenant Tiers ────────────────────────────────────────────────
export type TenantTier = 'starter' | 'growth' | 'enterprise'

export const TIER_RATE_LIMITS: Record<TenantTier, number> = {
  starter: 60,
  growth: 300,
  enterprise: 1000,
}

// ─── API Key ─────────────────────────────────────────────────────
export interface TenantApiKeyRecord {
  id: string
  projectId: string
  projectName: string
  keyHash: string
  keyPrefix: string
  tier: TenantTier
  isTest: boolean
  rateLimit: number
  createdAt: number
  lastUsedAt: number
  requestsThisMinute: number
  minuteStart: number
  isRevoked: boolean
}

// ─── Webhook ─────────────────────────────────────────────────────
export const WEBHOOK_EVENTS = [
  'order.created',
  'order.dispatched',
  'order.assigned',
  'order.picked_up',
  'order.delivered',
  'order.cancelled',
  'order.sla_warning',
  'order.sla_breach',
  'test',
] as const

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number]

export interface TenantWebhookConfig {
  projectId: string
  callbackUrl: string
  secret: string
  events: string[]
  isActive: boolean
  failureCount: number
  lastFailure: number | null
  lastSuccess: number | null
}

export interface WebhookDeliveryResult {
  success: boolean
  webhookId: string
  event: string
  statusCode: number | null
  duration: number
  error?: string
  mock: boolean
}

export interface WebhookLog {
  id: string
  projectId: string
  event: string
  webhookId: string
  payload: any
  result: WebhookDeliveryResult
  timestamp: number
}

// ─── Tenant Config ───────────────────────────────────────────────
export interface PortalTenantConfig {
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

// ─── Orders ──────────────────────────────────────────────────────
export interface CreateOrderRequest {
  externalOrderId: string
  projectId: string
  originId: string
  deliveryLocation: { lat: number; lng: number }
  customerName: string
  mode: 'instant' | 'standard' | 'flex'
  isFrozen?: boolean
  deci?: number
  slotStart?: number
  deadline?: number
  metadata?: Record<string, any>
}

// ─── Tracking ────────────────────────────────────────────────────
export interface TimelineEntry {
  event: string
  label: string
  timestamp: string | null
  completed: boolean
  active: boolean
  details?: Record<string, any>
}

export interface TrackingResponse {
  orderId: string
  status: string
  statusLabel: string
  timeline: TimelineEntry[]
  courier: {
    name: string
    phone: string
    location: { lat: number; lng: number } | null
  } | null
  estimatedDelivery: string | null
  branding: {
    projectName: string
    logoUrl: string | null
    primaryColor: string
    secondaryColor: string
  }
}

// ─── API Response ────────────────────────────────────────────────
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  meta?: any
}

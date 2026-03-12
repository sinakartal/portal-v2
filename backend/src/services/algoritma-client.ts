/**
 * Algoritma API HTTP client.
 * Portal makes all dispatch/route/order operations through this client.
 * Algoritma runs at http://localhost:3001 by default.
 */

import { config } from '../config/env'
import { CreateOrderRequest } from '../models/portal-types'
import { logger } from '../utils/logger'

const TIMEOUT = 10000 // 10 seconds

interface AlgoritmaResponse {
  success: boolean
  data?: any
  error?: string
  raw?: any
}

export class AlgoritmaClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.algoritmaUrl
  }

  private async request(method: string, path: string, body?: any): Promise<AlgoritmaResponse> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT)

    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(url, options)
      const data: any = await response.json()

      if (!response.ok) {
        logger.warn('Algoritma API error', { method, path, status: response.status, data })
        return { success: false, error: data.error || `HTTP ${response.status}`, raw: data }
      }

      // Normalize response: always return { success, data, raw }
      if (data.success !== undefined) {
        return { success: data.success, data: data.data || data, raw: data }
      }

      return { success: true, data, raw: data }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        logger.error('Algoritma API timeout', { method, path })
        return { success: false, error: 'Request timeout' }
      }
      logger.error('Algoritma API connection error', { method, path, error: err.message })
      return { success: false, error: `Connection error: ${err.message}` }
    } finally {
      clearTimeout(timeout)
    }
  }

  // ─── Order Operations ──────────────────────────────────────────

  async createOrder(orderData: CreateOrderRequest): Promise<AlgoritmaResponse> {
    return this.request('POST', '/api/webhook/portal', {
      type: 'new_order',
      payload: orderData,
    })
  }

  /** Webhook üzerinden sipariş oluştur (new_order type) */
  async createOrderViaWebhook(payload: any): Promise<AlgoritmaResponse> {
    return this.request('POST', '/api/webhook/portal', {
      type: 'new_order',
      payload,
    })
  }

  async getOrders(filters?: { projectId?: string; status?: string }): Promise<AlgoritmaResponse> {
    const result = await this.request('GET', '/api/orders')
    if (!result.success) return result

    let orders = Array.isArray(result.data) ? result.data : result.data?.orders || []

    // Client-side filtering
    if (filters?.projectId) {
      orders = orders.filter((o: any) => o.projectId === filters.projectId)
    }
    if (filters?.status) {
      orders = orders.filter((o: any) => o.status === filters.status)
    }

    return { success: true, data: orders, raw: result.raw }
  }

  async getOrderById(orderId: string): Promise<AlgoritmaResponse> {
    const result = await this.request('GET', '/api/orders')
    if (!result.success) return result

    const orders = Array.isArray(result.data) ? result.data : result.data?.orders || []
    const order = orders.find((o: any) => o.id === orderId || o.orderId === orderId)

    if (!order) {
      return { success: false, error: 'Order not found' }
    }
    return { success: true, data: order }
  }

  async cancelOrder(orderId: string): Promise<AlgoritmaResponse> {
    return this.request('POST', '/api/webhook/portal', {
      type: 'cancel_order',
      payload: { orderId },
    })
  }

  // ─── Route Operations ────────────────────────────────────────

  async getRoutes(): Promise<AlgoritmaResponse> {
    return this.request('GET', '/api/routes')
  }

  // ─── Courier Operations ──────────────────────────────────────

  async getCouriers(): Promise<AlgoritmaResponse> {
    return this.request('GET', '/api/couriers')
  }

  // ─── Project Operations ────────────────────────────────────────

  async getProject(projectId: string): Promise<AlgoritmaResponse> {
    return this.request('GET', `/api/projects/${projectId}`)
  }

  async getProjects(): Promise<AlgoritmaResponse> {
    return this.request('GET', '/api/projects')
  }

  async createProject(data: any): Promise<AlgoritmaResponse> {
    return this.request('POST', '/api/projects', data)
  }

  // ─── Analytics ─────────────────────────────────────────────────

  async getTenantSummary(projectId: string): Promise<AlgoritmaResponse> {
    return this.request('GET', `/api/analytics/tenant/${projectId}/summary`)
  }

  async getTenantSLA(projectId: string): Promise<AlgoritmaResponse> {
    return this.request('GET', `/api/analytics/tenant/${projectId}/sla`)
  }

  // ─── Checkout ──────────────────────────────────────────────────

  async getCheckoutOptions(data: any): Promise<AlgoritmaResponse> {
    return this.request('POST', '/api/v2/checkout/options', data)
  }

  // ─── Pricing ───────────────────────────────────────────────────

  async getPricingRules(): Promise<AlgoritmaResponse> {
    return this.request('GET', '/api/pricing/rules')
  }

  async calculatePrice(data: any): Promise<AlgoritmaResponse> {
    return this.request('POST', '/api/pricing/calculate', data)
  }

  // ─── Stats ─────────────────────────────────────────────────────

  async getStats(): Promise<AlgoritmaResponse> {
    return this.request('GET', '/api/stats')
  }

  // ─── Event History ─────────────────────────────────────────────

  async getEventHistory(limit?: number): Promise<AlgoritmaResponse> {
    const query = limit ? `?limit=${limit}` : ''
    return this.request('GET', `/api/events/history${query}`)
  }

  // ─── Dispatch ──────────────────────────────────────────────────

  async runDispatch(): Promise<AlgoritmaResponse> {
    return this.request('POST', '/api/dispatch/run')
  }

  // ─── Portal Integration ────────────────────────────────────────

  async getPortalStatus(): Promise<AlgoritmaResponse> {
    return this.request('GET', '/api/portal/status')
  }

  async getPortalLogs(): Promise<AlgoritmaResponse> {
    return this.request('GET', '/api/portal/logs')
  }

  // ─── Test / Dev ────────────────────────────────────────────────

  async generateTestData(): Promise<AlgoritmaResponse> {
    return this.request('POST', '/api/generate')
  }

  // ─── Health ────────────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.request('GET', '/health')
      return result.success !== false
    } catch {
      return false
    }
  }
}

// Singleton instance
export const algoritmaClient = new AlgoritmaClient()

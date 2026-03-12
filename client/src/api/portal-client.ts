import type { ApiResponse } from '../types'

const BASE_URL = '/api'

class PortalClient {
  private tenantApiKey: string | null = null
  private adminApiKey: string | null = null

  setTenantApiKey(key: string) { this.tenantApiKey = key }
  setAdminApiKey(key: string) { this.adminApiKey = key }
  clearAuth() { this.tenantApiKey = null; this.adminApiKey = null }

  private async request(method: string, path: string, body?: any, auth?: 'tenant' | 'admin'): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }

    if (auth === 'tenant' && this.tenantApiKey) {
      headers['Authorization'] = `Bearer ${this.tenantApiKey}`
    } else if (auth === 'admin' && this.adminApiKey) {
      headers['X-Admin-Key'] = this.adminApiKey
    }

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
      return await res.json()
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // ─── Admin API ──────────────────────────────────────────────
  getAdminOverview() { return this.request('GET', '/admin/overview', undefined, 'admin') }
  getTenants() { return this.request('GET', '/admin/tenants', undefined, 'admin') }
  getTenant(projectId: string) { return this.request('GET', `/admin/tenants/${projectId}`, undefined, 'admin') }
  createTenant(data: any) { return this.request('POST', '/admin/tenants', data, 'admin') }
  updateTenant(projectId: string, data: any) { return this.request('PUT', `/admin/tenants/${projectId}`, data, 'admin') }
  regenerateKey(projectId: string) { return this.request('POST', `/admin/tenants/${projectId}/regenerate-key`, undefined, 'admin') }
  deactivateTenant(projectId: string) { return this.request('DELETE', `/admin/tenants/${projectId}`, undefined, 'admin') }

  // ─── Tenant API ─────────────────────────────────────────────
  getTenantStats() { return this.request('GET', '/v2/tenant/stats', undefined, 'tenant') }
  getTenantOrders(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request('GET', `/v2/tenant/orders${query}`, undefined, 'tenant')
  }
  getTenantOrder(id: string) { return this.request('GET', `/v2/tenant/orders/${id}`, undefined, 'tenant') }
  createOrder(data: any) { return this.request('POST', '/v2/tenant/orders', data, 'tenant') }
  cancelOrder(id: string) { return this.request('POST', `/v2/tenant/orders/${id}/cancel`, undefined, 'tenant') }
  getTenantInvoices() { return this.request('GET', '/v2/tenant/invoices', undefined, 'tenant') }
  getCheckoutOptions(data: any) { return this.request('POST', '/v2/tenant/checkout/options', data, 'tenant') }

  // ─── Tenant Config API ─────────────────────────────────────
  getTenantConfig() { return this.request('GET', '/v2/tenant/config', undefined, 'tenant') }
  updateTenantConfig(data: any) { return this.request('PUT', '/v2/tenant/config', data, 'tenant') }
  testWebhook() { return this.request('POST', '/v2/tenant/config/test-webhook', undefined, 'tenant') }

  // ─── Tracking API (public) ─────────────────────────────────
  getTracking(orderId: string) { return this.request('GET', `/v2/tracking/${orderId}`) }

  // ─── Auth validation ───────────────────────────────────────
  async validateTenantKey(apiKey: string): Promise<ApiResponse> {
    this.setTenantApiKey(apiKey)
    const result = await this.getTenantStats()
    if (!result.success) { this.tenantApiKey = null }
    return result
  }

  async validateAdminKey(adminKey: string): Promise<ApiResponse> {
    this.setAdminApiKey(adminKey)
    const result = await this.getAdminOverview()
    if (!result.success) { this.adminApiKey = null }
    return result
  }
}

export const portalClient = new PortalClient()

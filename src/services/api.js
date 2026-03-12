/**
 * Bringo API Service
 * mockData.js'in yerini alir — gercek API cagrilari yapar
 *
 * Iki API kaynagi:
 * 1. Algoritma API (/algoritma → http://localhost:3001) — dispatch, siparis, kurye, rota
 * 2. Portal Backend API (/portal-api → http://localhost:3002) — tenant, auth, webhook
 */

const ALGORITMA = '/algoritma'
const PORTAL = '/portal-api'

function getAuthHeaders() {
  const token = localStorage.getItem('bringo_token')
  const projectId = localStorage.getItem('bringo_impersonate_tenant')
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (projectId) headers['X-Tenant-Id'] = projectId
  return headers
}

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    })
    const data = await res.json()
    return { ok: res.ok, data }
  } catch (err) {
    console.error(`[API] ${url}:`, err.message)
    return { ok: false, data: null, error: err.message }
  }
}

// ========= ALGORITMA API (operasyon verileri) =========

// Siparisler
export async function getOrders() {
  return fetchJson(`${ALGORITMA}/api/orders`)
}

export async function getOrderById(orderId) {
  const result = await getOrders()
  if (!result.ok) return result
  const orders = Array.isArray(result.data) ? result.data : result.data?.orders || []
  const order = orders.find(o => o.id === orderId || o.externalOrderId === orderId)
  return { ok: !!order, data: order }
}

// Siparis olustur (webhook uzerinden)
export async function createOrder(orderData) {
  return fetchJson(`${ALGORITMA}/api/webhook/portal`, {
    method: 'POST',
    body: JSON.stringify({ type: 'new_order', payload: orderData }),
  })
}

// Siparis iptal
export async function cancelOrder(orderId) {
  return fetchJson(`${ALGORITMA}/api/webhook/portal`, {
    method: 'POST',
    body: JSON.stringify({ type: 'cancel_order', payload: { orderId } }),
  })
}

// Rotalar
export async function getRoutes() {
  return fetchJson(`${ALGORITMA}/api/routes`)
}

export async function getRouteById(routeId) {
  return fetchJson(`${ALGORITMA}/api/routes/${routeId}`)
}

// Kuryeler
export async function getCouriers() {
  return fetchJson(`${ALGORITMA}/api/couriers`)
}

// Istatistikler
export async function getStats() {
  return fetchJson(`${ALGORITMA}/api/stats`)
}

// Projeler
export async function getProjects() {
  return fetchJson(`${ALGORITMA}/api/projects`)
}

export async function getProject(projectId) {
  return fetchJson(`${ALGORITMA}/api/projects/${projectId}`)
}

export async function createProject(data) {
  return fetchJson(`${ALGORITMA}/api/projects`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Dispatch calistir
export async function runDispatch() {
  return fetchJson(`${ALGORITMA}/api/dispatch/run`, { method: 'POST' })
}

export async function runDispatchOsrm() {
  return fetchJson(`${ALGORITMA}/api/dispatch/run-osrm`, { method: 'POST' })
}

// Test verisi uret
export async function generateTestData(orderCount = 30, courierCount = 10) {
  return fetchJson(`${ALGORITMA}/api/generate`, {
    method: 'POST',
    body: JSON.stringify({ orderCount, courierCount }),
  })
}

// Teklifler
export async function getOffers() {
  return fetchJson(`${ALGORITMA}/api/offers`)
}

export async function acceptOffer(offerId) {
  return fetchJson(`${ALGORITMA}/api/offers/${offerId}/accept`, { method: 'POST' })
}

export async function rejectOffer(offerId) {
  return fetchJson(`${ALGORITMA}/api/offers/${offerId}/reject`, { method: 'POST' })
}

// Fiyatlama
export async function getPricingRules() {
  return fetchJson(`${ALGORITMA}/api/pricing/rules`)
}

export async function calculatePrice(data) {
  return fetchJson(`${ALGORITMA}/api/pricing/calculate`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Checkout
export async function getCheckoutOptions(data) {
  return fetchJson(`${ALGORITMA}/api/v2/checkout/options`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Analytics
export async function getAnalyticsSummary() {
  return fetchJson(`${ALGORITMA}/api/analytics/summary`)
}

export async function getTenantAnalytics(projectId) {
  return fetchJson(`${ALGORITMA}/api/analytics/tenant/${projectId}/summary`)
}

export async function getTenantSLA(projectId) {
  return fetchJson(`${ALGORITMA}/api/analytics/tenant/${projectId}/sla`)
}

// Partners
export async function getPartners() {
  return fetchJson(`${ALGORITMA}/api/partners`)
}

// Events
export async function getEventHistory(limit = 100) {
  return fetchJson(`${ALGORITMA}/api/events/history?limit=${limit}`)
}

// Incentives
export async function getIncentivesSummary() {
  return fetchJson(`${ALGORITMA}/api/incentives/summary`)
}

// Algorithm Config
export async function getAlgorithmConfig() {
  return fetchJson(`${ALGORITMA}/api/algorithm-config`)
}

export async function updateAlgorithmConfig(data) {
  return fetchJson(`${ALGORITMA}/api/algorithm-config`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// OSRM Health
export async function getOsrmHealth() {
  return fetchJson(`${ALGORITMA}/api/osrm/health`)
}

// Copilot
export async function sendCopilotMessage(message, context = null) {
  return fetchJson(`${ALGORITMA}/api/copilot/chat`, {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  })
}

// Partner transfer
export async function transferOrders(data) {
  return fetchJson(`${ALGORITMA}/api/dispatch/transfer`, {
    method: 'POST', body: JSON.stringify(data),
  })
}

export async function evaluateTransfer() {
  return fetchJson(`${ALGORITMA}/api/dispatch/evaluate-transfer`, { method: 'POST' })
}

export async function getTransferCompare() {
  return fetchJson(`${ALGORITMA}/api/dispatch/transfer-compare`)
}

// Batch reroute
export async function batchReroute() {
  return fetchJson(`${ALGORITMA}/api/dispatch/batch-reroute`, { method: 'POST' })
}

// Route operations
export async function reoptimizeRoute(routeId) {
  return fetchJson(`${ALGORITMA}/api/routes/${routeId}/reoptimize`, { method: 'POST' })
}

export async function insertOrderToRoute(routeId, orderId, position) {
  return fetchJson(`${ALGORITMA}/api/routes/${routeId}/insert`, {
    method: 'POST',
    body: JSON.stringify({ orderId, position }),
  })
}

export async function removeOrderFromRoute(routeId, orderId) {
  return fetchJson(`${ALGORITMA}/api/routes/${routeId}/remove`, {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  })
}

export async function swapOrders(routeId, orderIdA, orderIdB) {
  return fetchJson(`${ALGORITMA}/api/routes/${routeId}/swap`, {
    method: 'POST',
    body: JSON.stringify({ orderIdA, orderIdB }),
  })
}

// Project branch & courier management
export async function addBranch(projectId, branchData) {
  return fetchJson(`${ALGORITMA}/api/projects/${projectId}/branches`, {
    method: 'POST',
    body: JSON.stringify(branchData),
  })
}

export async function assignCourier(projectId, courierId) {
  return fetchJson(`${ALGORITMA}/api/projects/${projectId}/couriers`, {
    method: 'POST',
    body: JSON.stringify({ courierId }),
  })
}

export async function removeCourier(projectId, courierId) {
  return fetchJson(`${ALGORITMA}/api/projects/${projectId}/couriers/${courierId}`, {
    method: 'DELETE',
  })
}

// Surge pricing
export async function getSurgeStatus() {
  return fetchJson(`${ALGORITMA}/api/pricing/surge`)
}

// Pricing rule CRUD
export async function addPricingRule(ruleData) {
  return fetchJson(`${ALGORITMA}/api/pricing/rules`, {
    method: 'POST',
    body: JSON.stringify(ruleData),
  })
}

export async function deletePricingRule(ruleId) {
  return fetchJson(`${ALGORITMA}/api/pricing/rules/${ruleId}`, {
    method: 'DELETE',
  })
}

// VROOM/Solver health
export async function getVroomHealth() {
  return fetchJson(`${ALGORITMA}/api/solver/health`)
}

// Dispatch single order
export async function dispatchOrder(orderId) {
  return fetchJson(`${ALGORITMA}/api/dispatch/order/${orderId}`, { method: 'POST' })
}

// Dispatch batch
export async function dispatchBatch(orderIds) {
  return fetchJson(`${ALGORITMA}/api/dispatch/batch`, {
    method: 'POST',
    body: JSON.stringify({ orderIds }),
  })
}

// Copilot history
export async function getCopilotHistory() {
  return fetchJson(`${ALGORITMA}/api/copilot/history`)
}

// ========= PORTAL API (tenant/admin) =========

export async function getPortalHealth() {
  return fetchJson(`${PORTAL}/health`)
}

export async function getAdminOverview(adminKey) {
  return fetchJson(`${PORTAL}/api/admin/overview`, {
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
  })
}

export async function getPortalTenants(adminKey) {
  return fetchJson(`${PORTAL}/api/admin/tenants`, {
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
  })
}

// Portal admin tenant CRUD
export async function createTenant(adminKey, data) {
  return fetchJson(`${PORTAL}/api/admin/tenants`, {
    method: 'POST',
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
    body: JSON.stringify(data),
  })
}

export async function getTenantDetail(adminKey, projectId) {
  return fetchJson(`${PORTAL}/api/admin/tenants/${projectId}`, {
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
  })
}

export async function regenerateApiKey(adminKey, projectId) {
  return fetchJson(`${PORTAL}/api/admin/tenants/${projectId}/regenerate-key`, {
    method: 'POST',
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
  })
}

// Tenant Settings (save/load tenant-specific settings)
export async function getTenantSettings() {
  return fetchJson(`${PORTAL}/api/settings`)
}

export async function saveTenantSettings(data) {
  return fetchJson(`${PORTAL}/api/settings`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Webhook proxy (avoids CORS by routing through backend)
export async function testWebhookProxy(webhookUrl, payload) {
  return fetchJson(`${PORTAL}/api/webhook/test`, {
    method: 'POST',
    body: JSON.stringify({ url: webhookUrl, payload }),
  })
}

// Users CRUD
export async function getUsers() {
  return fetchJson(`${PORTAL}/api/users`)
}

export async function createUser(data) {
  return fetchJson(`${PORTAL}/api/users`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateUser(userId, data) {
  return fetchJson(`${PORTAL}/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteUser(userId) {
  return fetchJson(`${PORTAL}/api/users/${userId}`, {
    method: 'DELETE',
  })
}

// ========= SSE EVENT STREAM =========

export function connectEventStream(onEvent) {
  const url = `${ALGORITMA}/api/webhook/stream`
  const evtSource = new EventSource(url)

  evtSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onEvent(data)
    } catch (e) {
      console.warn('[SSE] Parse error:', e)
    }
  }

  evtSource.onerror = () => {
    console.warn('[SSE] Baglanti koptu, yeniden deneniyor...')
  }

  return evtSource
}

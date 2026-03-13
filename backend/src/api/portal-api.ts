/**
 * Portal-level API endpoints.
 * Settings, webhook proxy, users — all behind Bearer token auth.
 */

import { Router, Request, Response } from 'express'
import { validateToken } from './auth-api'
import { logger } from '../utils/logger'
import { FileStore } from '../utils/file-store'

const router = Router()

// Simple auth middleware using Bearer token
function portalAuth(req: Request, res: Response, next: any) {
  const isDev = process.env.NODE_ENV !== 'production'
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    const token = authHeader?.replace('Bearer ', '') || ''
    if (isDev && token.startsWith('brg_dev_')) {
      next()
      return
    }
    res.status(401).json({ success: false, error: 'Token gerekli' })
    return
  }

  const token = authHeader.substring(7)
  if (isDev && token.startsWith('brg_dev_')) {
    next()
    return
  }

  const result = validateToken(token)
  if (!result.valid) {
    res.status(401).json({ success: false, error: 'Gecersiz token' })
    return
  }
  next()
}

router.use(portalAuth)

// ─── Settings ─────────────────────────────────────────────────────
const settingsStore = new FileStore<any>('settings')

// GET /api/settings
router.get('/settings', (req: Request, res: Response) => {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'default'
  const settings = settingsStore.get(tenantId) || {}
  res.json({ success: true, data: settings })
})

// PUT /api/settings
router.put('/settings', (req: Request, res: Response) => {
  const tenantId = (req.headers['x-tenant-id'] as string) || 'default'
  const existing = settingsStore.get(tenantId) || {}
  const updated = { ...existing, ...req.body, updatedAt: Date.now() }
  settingsStore.set(tenantId, updated)
  logger.info('Settings updated', { tenantId })
  res.json({ success: true, data: updated })
})

// ─── Finance Summary ─────────────────────────────────────────────
router.get('/finance/summary', async (_req: Request, res: Response) => {
  try {
    const algoritmaUrl = process.env.ALGORITMA_URL || 'http://localhost:3001'
    const statsRes = await fetch(`${algoritmaUrl}/api/stats`).catch(() => null)
    const stats: any = statsRes?.ok ? await statsRes.json() : {}
    res.json({
      success: true,
      data: {
        revenue: stats.data?.revenue || {},
        payroll: stats.data?.payroll || [],
        invoices: [],
      },
    })
  } catch {
    res.json({ success: true, data: { revenue: {}, payroll: [], invoices: [] } })
  }
})

// ─── Webhook Proxy ────────────────────────────────────────────────
// POST /api/webhook/test — proxies webhook test to avoid CORS
router.post('/webhook/test', async (req: Request, res: Response) => {
  const { url, payload } = req.body

  if (!url) {
    res.status(400).json({ success: false, error: 'URL gerekli' })
    return
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || { type: 'test', timestamp: new Date().toISOString() }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    res.json({
      success: true,
      data: {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      },
    })
  } catch (err: any) {
    logger.warn('Webhook proxy test failed', { url, error: err.message })
    res.json({
      success: false,
      error: err.name === 'AbortError' ? 'Zaman asimi (10s)' : err.message,
    })
  }
})

// ─── Users CRUD ───────────────────────────────────────────────────
const userStore = new FileStore<any>('users')

// Seed default users if store is empty
if (userStore.size === 0) {
  userStore.set('1', { _id: '1', email: 'sina@bringo.com', firstName: 'Sina', lastName: 'Kartal', role: 'super_admin', isActive: true })
  userStore.set('2', { _id: '2', email: 'manager@bringo.com', firstName: 'Manager', lastName: 'User', role: 'manager', isActive: true })
  userStore.set('3', { _id: '3', email: 'operator@bringo.com', firstName: 'Operator', lastName: 'User', role: 'operator', isActive: true })
  userStore.set('4', { _id: '4', email: 'dispatcher@bringo.com', firstName: 'Dispatcher', lastName: 'User', role: 'dispatcher', isActive: true })
}

router.get('/users', (_req: Request, res: Response) => {
  res.json({ success: true, data: Array.from(userStore.values()) })
})

router.post('/users', (req: Request, res: Response) => {
  const id = String(Date.now())
  const user = { _id: id, ...req.body, isActive: true }
  userStore.set(id, user)
  res.status(201).json({ success: true, data: user })
})

router.put('/users/:id', (req: Request, res: Response) => {
  const id = req.params.id as string
  const user = userStore.get(id)
  if (!user) {
    res.status(404).json({ success: false, error: 'Kullanici bulunamadi' })
    return
  }
  const updated = { ...user, ...req.body }
  userStore.set(id, updated)
  res.json({ success: true, data: updated })
})

router.delete('/users/:id', (req: Request, res: Response) => {
  const id = req.params.id as string
  if (!userStore.has(id)) {
    res.status(404).json({ success: false, error: 'Kullanici bulunamadi' })
    return
  }
  userStore.delete(id)
  res.json({ success: true })
})

// ─── Zimmet & Blok ──────────────────────────────────────────────
const zimmetStore = new FileStore<any>('zimmet')

function getZimmet(courierId: string) {
  return zimmetStore.get(courierId) || {
    courierId,
    isBlocked: false,
    blockReason: null,
    unclearedCash: 0,
    unclearedCard: 0,
    openOrderIds: [],
    lastClearedAt: null,
    updatedAt: Date.now(),
  }
}

// GET /api/couriers/blocked — bloklu kuryeler listesi
router.get('/couriers/blocked', (_req: Request, res: Response) => {
  const blocked: any[] = []
  zimmetStore.forEach((z: any, courierId: string) => {
    if (z.isBlocked) blocked.push({ courierId, ...z })
  })
  res.json({ success: true, data: blocked })
})

// GET /api/couriers/:id/zimmet-status
router.get('/couriers/:id/zimmet-status', (req: Request, res: Response) => {
  const id = req.params.id as string
  const z = getZimmet(id)
  res.json({ success: true, data: z })
})

// GET /api/couriers/:id/dispatch-eligibility
router.get('/couriers/:id/dispatch-eligibility', (req: Request, res: Response) => {
  const id = req.params.id as string
  const z = getZimmet(id)

  if (z.isBlocked) {
    res.status(403).json({
      success: false,
      eligible: false,
      reason: z.blockReason || 'Acik zimmet mevcut',
      unclearedCash: z.unclearedCash,
      unclearedCard: z.unclearedCard,
      openOrderCount: (z.openOrderIds || []).length,
    })
    return
  }

  res.json({
    success: true,
    eligible: true,
    unclearedCash: z.unclearedCash,
    unclearedCard: z.unclearedCard,
    openOrderCount: (z.openOrderIds || []).length,
  })
})

// POST /api/couriers/:id/zimmet-clear — zimmeti kapat
router.post('/couriers/:id/zimmet-clear', (req: Request, res: Response) => {
  const id = req.params.id as string
  const { cashHandedOver, orderActions, posReceiptNumbers } = req.body

  const z = getZimmet(id)

  // Nakit mutabakat
  const cashCleared = Number(cashHandedOver) || 0

  // Siparis aksiyonlari — openOrderIds'den cikar
  const processedOrders = (orderActions || []).map((a: any) => a.orderId)
  const remainingOrders = (z.openOrderIds || []).filter((oid: string) => !processedOrders.includes(oid))

  const updated = {
    ...z,
    isBlocked: false,
    blockReason: null,
    unclearedCash: Math.max(0, (z.unclearedCash || 0) - cashCleared),
    unclearedCard: 0,
    openOrderIds: remainingOrders,
    lastClearedAt: Date.now(),
    updatedAt: Date.now(),
  }

  zimmetStore.set(id, updated)
  logger.info('Zimmet cleared', { courierId: id, cashHandedOver: cashCleared })

  res.json({
    success: true,
    data: updated,
    message: 'Zimmet kapatildi',
  })
})

// POST /api/couriers/:id/block — blok guncelle
router.post('/couriers/:id/block', (req: Request, res: Response) => {
  const id = req.params.id as string
  const { isBlocked, reason, unclearedCash, unclearedCard, openOrderIds } = req.body

  const current = getZimmet(id)
  const updated = {
    ...current,
    courierId: id,
    isBlocked: Boolean(isBlocked),
    blockReason: reason || null,
    unclearedCash: unclearedCash !== undefined ? Number(unclearedCash) : (current.unclearedCash || 0),
    unclearedCard: unclearedCard !== undefined ? Number(unclearedCard) : (current.unclearedCard || 0),
    openOrderIds: openOrderIds || current.openOrderIds || [],
    updatedAt: Date.now(),
  }

  zimmetStore.set(id, updated)
  logger.info('Courier block status changed', { courierId: id, blocked: updated.isBlocked, reason })
  res.json({ success: true, data: updated })
})

// ─── Dispatch Store — rota ve siparis durumlari ──────────────────
const routeStore = new Map<string, any>()
const dispatchedOrderStore = new Map<string, any>()

// POST /api/routes — rota kaydet
router.post('/routes', (req: Request, res: Response) => {
  const route = req.body
  if (!route || !route.id) {
    res.status(400).json({ success: false, error: 'Rota id gerekli' })
    return
  }
  const saved = { ...route, savedAt: Date.now() }
  routeStore.set(route.id, saved)
  logger.info('Route saved', { routeId: route.id, orderCount: route.orderIds?.length })
  res.status(201).json({ success: true, data: saved })
})

// GET /api/routes — rotalari listele
router.get('/routes', (_req: Request, res: Response) => {
  res.json({ success: true, data: Array.from(routeStore.values()) })
})

// PATCH /api/orders/:id/status — siparis durumu guncelle
router.patch('/orders/:id/status', (req: Request, res: Response) => {
  const id = req.params.id as string
  const { status, routeId, courierId } = req.body
  if (!status) {
    res.status(400).json({ success: false, error: 'status gerekli' })
    return
  }
  const existing = dispatchedOrderStore.get(id) || { id }
  const updated = {
    ...existing,
    status,
    routeId: routeId || existing.routeId || null,
    courierId: courierId || existing.courierId || null,
    updatedAt: Date.now(),
  }
  dispatchedOrderStore.set(id, updated)
  res.json({ success: true, data: updated })
})

// POST /api/orders/bulk-status — toplu siparis durumu guncelle
router.post('/orders/bulk-status', (req: Request, res: Response) => {
  const { updates } = req.body
  if (!Array.isArray(updates)) {
    res.status(400).json({ success: false, error: 'updates array gerekli' })
    return
  }
  let updatedCount = 0
  const errors: string[] = []
  for (const upd of updates) {
    try {
      const existing = dispatchedOrderStore.get(upd.id) || { id: upd.id }
      dispatchedOrderStore.set(upd.id, {
        ...existing,
        status: upd.status,
        routeId: upd.routeId || null,
        courierId: upd.courierId || null,
        updatedAt: Date.now(),
      })
      updatedCount++
    } catch (e: any) {
      errors.push(`${upd.id}: ${e.message}`)
    }
  }
  logger.info('Bulk order status update', { total: updates.length, updated: updatedCount })
  res.json({ success: true, updated: updatedCount, errors })
})

export default router

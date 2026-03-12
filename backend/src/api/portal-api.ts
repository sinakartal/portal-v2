/**
 * Portal-level API endpoints.
 * Settings, webhook proxy, users — all behind Bearer token auth.
 */

import { Router, Request, Response } from 'express'
import { validateToken } from './auth-api'
import { logger } from '../utils/logger'

const router = Router()

// Simple auth middleware using Bearer token
function portalAuth(req: Request, res: Response, next: any) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    // Allow mock tokens for dev
    const token = authHeader?.replace('Bearer ', '') || ''
    if (token.startsWith('mock_token_')) {
      next()
      return
    }
    res.status(401).json({ success: false, error: 'Token gerekli' })
    return
  }

  const token = authHeader.substring(7)
  if (token.startsWith('mock_token_')) {
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
const settingsStore = new Map<string, any>()

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
const userStore = new Map<string, any>()

// Seed some users
userStore.set('1', { _id: '1', email: 'sina@bringo.com', firstName: 'Sina', lastName: 'Kartal', role: 'super_admin', isActive: true })
userStore.set('2', { _id: '2', email: 'manager@bringo.com', firstName: 'Manager', lastName: 'User', role: 'manager', isActive: true })
userStore.set('3', { _id: '3', email: 'operator@bringo.com', firstName: 'Operator', lastName: 'User', role: 'operator', isActive: true })
userStore.set('4', { _id: '4', email: 'dispatcher@bringo.com', firstName: 'Dispatcher', lastName: 'User', role: 'dispatcher', isActive: true })

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
  const user = userStore.get(req.params.id)
  if (!user) {
    res.status(404).json({ success: false, error: 'Kullanici bulunamadi' })
    return
  }
  Object.assign(user, req.body)
  res.json({ success: true, data: user })
})

router.delete('/users/:id', (req: Request, res: Response) => {
  if (!userStore.has(req.params.id)) {
    res.status(404).json({ success: false, error: 'Kullanici bulunamadi' })
    return
  }
  userStore.delete(req.params.id)
  res.json({ success: true })
})

export default router

/**
 * Express application setup.
 * Mounts middleware, routes, and initializes services.
 */

import express from 'express'
import cors from 'cors'
import { config } from './config/env'
import { logger } from './utils/logger'
import { tenantAuthMiddleware } from './middleware/tenant-auth'
import { adminAuthMiddleware } from './middleware/admin-auth'
import { errorHandler } from './middleware/error-handler'
import { algoritmaClient } from './services/algoritma-client'
import { startEventListener, getEventListener } from './services/event-listener'

// Route imports
import healthRouter from './api/health'
import trackingRouter from './api/tracking-api'
import tenantApiRouter from './api/tenant-api'
import tenantConfigRouter from './api/tenant-config-api'
import adminApiRouter from './api/admin-api'
import authRouter from './api/auth-api'
import portalApiRouter from './api/portal-api'

const app = express()

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Request logging
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    })
  })
  next()
})

// ─── Routes ──────────────────────────────────────────────────────

// Public (no auth)
app.use('/health', healthRouter)
app.use('/api/v2/tracking', trackingRouter)
app.use('/api/auth', authRouter)

// Portal API (Bearer token auth)
app.use('/api', portalApiRouter)

// Tenant API (tenant auth)
app.use('/api/v2/tenant/config', tenantAuthMiddleware, tenantConfigRouter)
app.use('/api/v2/tenant', tenantAuthMiddleware, tenantApiRouter)

// Admin API (admin auth)
app.use('/api/admin', adminAuthMiddleware, adminApiRouter)

// Internal — Event listener status
app.get('/api/internal/event-listener', (_req, res) => {
  const listener = getEventListener()
  if (!listener) {
    res.json({ running: false, status: null })
    return
  }
  res.json({ running: true, status: listener.getStatus() })
})

// Root — API info
app.get('/', (_req, res) => {
  res.json({
    name: 'Bringo Portal API',
    version: '1.0',
    endpoints: {
      tenant: {
        'POST /api/v2/tenant/orders': 'Create order',
        'GET  /api/v2/tenant/orders': 'List orders',
        'GET  /api/v2/tenant/orders/:id': 'Order detail',
        'POST /api/v2/tenant/orders/:id/cancel': 'Cancel order',
        'GET  /api/v2/tenant/stats': 'Dashboard KPIs',
        'GET  /api/v2/tenant/invoices': 'Invoice info',
        'POST /api/v2/tenant/checkout/options': 'Checkout options',
        'GET  /api/v2/tenant/config': 'Get config',
        'PUT  /api/v2/tenant/config': 'Update config',
        'POST /api/v2/tenant/config/test-webhook': 'Test webhook',
      },
      tracking: {
        'GET /api/v2/tracking/:orderId': 'Public order tracking',
      },
      admin: {
        'POST   /api/admin/tenants': 'Create tenant',
        'GET    /api/admin/tenants': 'List tenants',
        'GET    /api/admin/tenants/:id': 'Tenant detail',
        'PUT    /api/admin/tenants/:id': 'Update tenant',
        'POST   /api/admin/tenants/:id/regenerate-key': 'Regenerate API key',
        'DELETE /api/admin/tenants/:id': 'Deactivate tenant',
        'GET    /api/admin/overview': 'Admin dashboard',
      },
      auth: {
        'POST /api/auth/login': 'User login',
        'GET  /api/auth/me': 'Current user info',
      },
      portal: {
        'GET  /api/settings': 'Get tenant settings',
        'PUT  /api/settings': 'Update tenant settings',
        'POST /api/webhook/test': 'Webhook proxy test',
        'GET  /api/users': 'List users',
        'POST /api/users': 'Create user',
        'PUT  /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user',
      },
      internal: {
        'GET /api/internal/event-listener': 'SSE listener status',
      },
      health: {
        'GET /health': 'Health check',
      },
    },
  })
})

// Global error handler (must be last)
app.use(errorHandler)

// ─── Server Startup ──────────────────────────────────────────────
export async function startServer(): Promise<void> {
  // Test Algoritma connection
  console.log('')
  console.log('  Algoritma API baglantisi kontrol ediliyor...')

  const algoritmaOk = await algoritmaClient.healthCheck()

  if (algoritmaOk) {
    logger.info('Algoritma API connected', { url: config.algoritmaUrl })
    console.log(`  ✓ Algoritma API bagli (${config.algoritmaUrl})`)
  } else {
    logger.warn('Algoritma API not reachable (will retry via SSE)', { url: config.algoritmaUrl })
    console.log(`  ✗ Algoritma API ulasilamadi (${config.algoritmaUrl})`)
    console.log('    SSE listener otomatik yeniden baglanti deneyecek')
  }

  // Start SSE event listener
  const listener = startEventListener(config.algoritmaUrl)
  logger.info('Event listener started')
  console.log('  ✓ SSE Event Listener baslatildi')

  // Start HTTP server
  app.listen(config.port, () => {
    console.log('')
    console.log('╔══════════════════════════════════════════════════╗')
    console.log('║           BRINGO PORTAL API v1.0                 ║')
    console.log('╠══════════════════════════════════════════════════╣')
    console.log(`║  Server:        http://localhost:${config.port}              ║`)
    console.log(`║  Algoritma:     ${config.algoritmaUrl.padEnd(31)}║`)
    console.log(`║  Env:           ${config.nodeEnv.padEnd(31)}║`)
    console.log(`║  SSE Listener:  ${algoritmaOk ? 'connected'.padEnd(31) : 'reconnecting...'.padEnd(31)}║`)
    console.log('╠══════════════════════════════════════════════════╣')
    console.log('║  Endpoints:                                      ║')
    console.log('║    /api/v2/tenant/*      Tenant API (auth)        ║')
    console.log('║    /api/v2/tracking/*    Public tracking           ║')
    console.log('║    /api/admin/*          Admin API                 ║')
    console.log('║    /api/internal/*       Internal status           ║')
    console.log('║    /health               Health check              ║')
    console.log('╚══════════════════════════════════════════════════╝')
    console.log('')
  })
}

export default app

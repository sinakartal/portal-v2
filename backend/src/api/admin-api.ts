/**
 * Admin API for tenant management.
 * Protected by admin-auth middleware (X-Admin-Key header).
 */

import { Router, Request, Response } from 'express'
import crypto from 'crypto'

function getParam(req: Request, name: string): string {
  const val = req.params[name]
  return Array.isArray(val) ? val[0] : val
}
import { generateApiKey, revokeApiKey, getKeyInfo, getAllKeys } from '../services/api-key-service'
import { algoritmaClient } from '../services/algoritma-client'
import * as webhookManager from '../services/webhook-manager'
import { tenantConfigStore, createDefaultConfig } from './tenant-config-api'
import { TenantTier } from '../models/portal-types'
import { logger } from '../utils/logger'

const router = Router()

// ─── POST /tenants — Create tenant ──────────────────────────────
router.post('/tenants', async (req: Request, res: Response) => {
  try {
    const { projectId, projectName, tier = 'starter', contactEmail = '', contactPhone = '' } = req.body

    if (!projectId || !projectName) {
      res.status(400).json({ success: false, error: 'projectId and projectName are required' })
      return
    }

    if (!['starter', 'growth', 'enterprise'].includes(tier)) {
      res.status(400).json({ success: false, error: 'Invalid tier' })
      return
    }

    // Check if tenant already exists
    if (tenantConfigStore.has(projectId)) {
      res.status(409).json({ success: false, error: 'Tenant already exists' })
      return
    }

    // Create config
    const config = createDefaultConfig(projectId, projectName, tier as TenantTier)
    config.contactEmail = contactEmail
    config.contactPhone = contactPhone

    // Generate webhook secret
    const webhookSecret = 'whsec_' + crypto.randomBytes(16).toString('hex')
    config.webhookSecret = webhookSecret

    tenantConfigStore.set(projectId, config)

    // Generate API key
    const { apiKey } = generateApiKey(projectId, projectName, tier as TenantTier)

    // Try to create project in Algoritma
    await algoritmaClient.createProject({ id: projectId, name: projectName }).catch(() => {
      logger.warn('Could not create project in Algoritma (may already exist)', { projectId })
    })

    logger.info('Tenant created', { projectId, projectName, tier })

    res.status(201).json({
      success: true,
      data: {
        projectId,
        projectName,
        tier,
        apiKey, // SHOWN ONLY ONCE
        webhookSecret, // SHOWN ONLY ONCE
        dashboardUrl: `/merchant-portal?projectId=${projectId}`,
        apiDocs: '/docs',
      },
    })
  } catch (err: any) {
    logger.error('Create tenant failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to create tenant' })
  }
})

// ─── GET /tenants — List all tenants ────────────────────────────
router.get('/tenants', async (_req: Request, res: Response) => {
  try {
    const tenants = Array.from(tenantConfigStore.values()).map((config) => {
      const keyInfo = getKeyInfo(config.projectId)
      return {
        projectId: config.projectId,
        projectName: config.projectName,
        tier: config.apiTier,
        contactEmail: config.contactEmail,
        apiKeyPrefix: keyInfo?.keyPrefix || null,
        apiKeyRevoked: keyInfo?.isRevoked || false,
        webhookConfigured: !!config.webhookUrl,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }
    })

    res.json({ success: true, data: tenants })
  } catch (err: any) {
    logger.error('List tenants failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to list tenants' })
  }
})

// ─── GET /tenants/:projectId — Tenant detail ────────────────────
router.get('/tenants/:projectId', async (req: Request, res: Response) => {
  try {
    const projectId = getParam(req, 'projectId')
    const config = tenantConfigStore.get(projectId)

    if (!config) {
      res.status(404).json({ success: false, error: 'Tenant not found' })
      return
    }

    const keyInfo = getKeyInfo(projectId)
    const webhook = webhookManager.getWebhook(projectId)
    const webhookLogs = webhookManager.getWebhookLogs(projectId, 10)

    // Try to get stats from Algoritma
    let stats = null
    try {
      const summary = await algoritmaClient.getTenantSummary(projectId)
      stats = summary.data || null
    } catch {
      // Algoritma may be down
    }

    res.json({
      success: true,
      data: {
        config,
        apiKey: keyInfo ? { prefix: keyInfo.keyPrefix, tier: keyInfo.tier, isRevoked: keyInfo.isRevoked, lastUsedAt: keyInfo.lastUsedAt } : null,
        webhook: webhook ? { url: webhook.callbackUrl, events: webhook.events, isActive: webhook.isActive, failureCount: webhook.failureCount } : null,
        recentWebhookLogs: webhookLogs,
        stats,
      },
    })
  } catch (err: any) {
    logger.error('Get tenant detail failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to fetch tenant detail' })
  }
})

// ─── PUT /tenants/:projectId — Update tenant ────────────────────
router.put('/tenants/:projectId', (req: Request, res: Response) => {
  try {
    const projectId = getParam(req, 'projectId')
    const config = tenantConfigStore.get(projectId)

    if (!config) {
      res.status(404).json({ success: false, error: 'Tenant not found' })
      return
    }

    // Admin can change tier, feature flags
    const { tier, checkoutWidgetEnabled, trackingPageEnabled } = req.body

    if (tier && ['starter', 'growth', 'enterprise'].includes(tier)) {
      config.apiTier = tier
    }
    if (checkoutWidgetEnabled !== undefined) {
      config.checkoutWidgetEnabled = checkoutWidgetEnabled
    }
    if (trackingPageEnabled !== undefined) {
      config.trackingPageEnabled = trackingPageEnabled
    }
    config.updatedAt = Date.now()

    res.json({ success: true, data: config })
  } catch (err: any) {
    logger.error('Update tenant failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to update tenant' })
  }
})

// ─── POST /tenants/:projectId/regenerate-key — Regenerate API key
router.post('/tenants/:projectId/regenerate-key', (req: Request, res: Response) => {
  try {
    const projectId = getParam(req, 'projectId')
    const config = tenantConfigStore.get(projectId)

    if (!config) {
      res.status(404).json({ success: false, error: 'Tenant not found' })
      return
    }

    // generateApiKey automatically revokes old key
    const { apiKey } = generateApiKey(projectId, config.projectName, config.apiTier)

    logger.info('API key regenerated', { projectId })

    res.json({
      success: true,
      data: {
        projectId,
        apiKey, // SHOWN ONLY ONCE
        message: 'Previous API key has been revoked. Store this key securely.',
      },
    })
  } catch (err: any) {
    logger.error('Regenerate key failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to regenerate key' })
  }
})

// ─── DELETE /tenants/:projectId — Deactivate tenant ─────────────
router.delete('/tenants/:projectId', (req: Request, res: Response) => {
  try {
    const projectId = getParam(req, 'projectId')
    const config = tenantConfigStore.get(projectId)

    if (!config) {
      res.status(404).json({ success: false, error: 'Tenant not found' })
      return
    }

    // Revoke API key
    revokeApiKey(projectId)

    // Disable webhook
    const webhook = webhookManager.getWebhook(projectId)
    if (webhook) {
      webhookManager.updateWebhook(projectId, { isActive: false })
    }

    logger.info('Tenant deactivated', { projectId })

    res.json({
      success: true,
      data: { projectId, status: 'deactivated', message: 'API key revoked, webhook disabled' },
    })
  } catch (err: any) {
    logger.error('Deactivate tenant failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to deactivate tenant' })
  }
})

// ─── GET /overview — Admin dashboard overview ───────────────────
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const totalTenants = tenantConfigStore.size
    const allKeys = getAllKeys()
    const activeKeys = allKeys.filter((k) => !k.isRevoked).length

    // Try to get global stats from Algoritma
    let globalStats = { totalOrders: 0, totalDeliveries: 0, avgSLA: 0 }
    try {
      const stats = await algoritmaClient.getStats()
      if (stats.data) {
        const data = stats.data
        globalStats = {
          totalOrders: data.totalOrders || data.orders?.total || 0,
          totalDeliveries: data.totalDeliveries || data.orders?.delivered || 0,
          avgSLA: data.avgSLA || data.sla?.percent || 0,
        }
      }
    } catch {
      // Algoritma may be down
    }

    res.json({
      success: true,
      data: {
        totalTenants,
        activeApiKeys: activeKeys,
        ...globalStats,
      },
    })
  } catch (err: any) {
    logger.error('Get admin overview failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to fetch overview' })
  }
})

export default router

/**
 * Tenant configuration API.
 * Allows tenants to manage their own settings: webhook URL, branding, etc.
 */

import { Router, Request, Response } from 'express'
import { PortalTenantConfig } from '../models/portal-types'
import * as webhookManager from '../services/webhook-manager'
import { logger } from '../utils/logger'

const router = Router()

// In-memory store
export const tenantConfigStore = new Map<string, PortalTenantConfig>()

export function createDefaultConfig(projectId: string, projectName: string, tier: 'starter' | 'growth' | 'enterprise'): PortalTenantConfig {
  const now = Date.now()
  return {
    projectId,
    projectName,
    logoUrl: null,
    primaryColor: '#f97316',
    secondaryColor: '#1a1a2e',
    contactEmail: '',
    contactPhone: '',
    webhookUrl: null,
    webhookSecret: null,
    webhookEvents: [],
    apiTier: tier,
    checkoutWidgetEnabled: false,
    trackingPageEnabled: true,
    onboardingStatus: {
      apiKeyCreated: true,
      firstOrderSent: false,
      webhookConfigured: false,
      firstDeliveryCompleted: false,
    },
    createdAt: now,
    updatedAt: now,
  }
}

// ─── GET / — Get config ─────────────────────────────────────────
router.get('/', (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!
    const config = tenantConfigStore.get(tenant.projectId)

    if (!config) {
      res.status(404).json({ success: false, error: 'Tenant config not found' })
      return
    }

    res.json({ success: true, data: config })
  } catch (err: any) {
    logger.error('Get tenant config failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to fetch config' })
  }
})

// ─── PUT / — Update config ──────────────────────────────────────
router.put('/', (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!
    const config = tenantConfigStore.get(tenant.projectId)

    if (!config) {
      res.status(404).json({ success: false, error: 'Tenant config not found' })
      return
    }

    const allowedFields = [
      'logoUrl', 'primaryColor', 'secondaryColor',
      'contactEmail', 'contactPhone',
      'webhookUrl', 'webhookEvents',
    ]

    const updates: any = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    Object.assign(config, updates, { updatedAt: Date.now() })

    // Sync webhook config with webhook-manager
    if (updates.webhookUrl !== undefined || updates.webhookEvents !== undefined) {
      if (config.webhookUrl && config.webhookSecret) {
        const existingWh = webhookManager.getWebhook(tenant.projectId)
        if (existingWh) {
          webhookManager.updateWebhook(tenant.projectId, {
            callbackUrl: config.webhookUrl,
            events: config.webhookEvents,
          })
        } else {
          webhookManager.registerWebhook({
            projectId: tenant.projectId,
            callbackUrl: config.webhookUrl,
            secret: config.webhookSecret,
            events: config.webhookEvents,
            isActive: true,
            failureCount: 0,
            lastFailure: null,
            lastSuccess: null,
          })
        }

        config.onboardingStatus.webhookConfigured = true
      }
    }

    res.json({ success: true, data: config })
  } catch (err: any) {
    logger.error('Update tenant config failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to update config' })
  }
})

// ─── POST /test-webhook — Send test webhook ─────────────────────
router.post('/test-webhook', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!
    const config = tenantConfigStore.get(tenant.projectId)

    if (!config?.webhookUrl) {
      res.status(400).json({ success: false, error: 'No webhook URL configured' })
      return
    }

    const result = await webhookManager.sendWebhook(tenant.projectId, 'test', {
      message: 'Test webhook from Bringo Portal',
      timestamp: new Date().toISOString(),
    })

    res.json({ success: true, data: result })
  } catch (err: any) {
    logger.error('Test webhook failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to send test webhook' })
  }
})

export default router

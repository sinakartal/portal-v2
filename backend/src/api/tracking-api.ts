/**
 * Public order tracking API. NO AUTH required.
 * Customers can view order status via tracking URL.
 */

import { Router, Request, Response } from 'express'
import { algoritmaClient } from '../services/algoritma-client'
import { tenantConfigStore } from './tenant-config-api'
import { TimelineEntry } from '../models/portal-types'
import { logger } from '../utils/logger'

const router = Router()

const STATUS_LABELS: Record<string, string> = {
  pending: 'Siparis Alindi',
  dispatched: 'Rotalandi',
  assigned: 'Kuryeye Atandi',
  picked_up: 'Magazadan Alindi',
  in_transit: 'Yolda',
  delivered: 'Teslim Edildi',
  cancelled: 'Iptal Edildi',
}

const TIMELINE_STEPS = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']

function mapStatusToTimeline(order: any): TimelineEntry[] {
  const currentStatus = order.status || 'pending'
  const currentIdx = TIMELINE_STEPS.indexOf(currentStatus)

  return TIMELINE_STEPS.map((step, idx) => {
    const completed = idx < currentIdx || (idx === currentIdx && step === 'delivered')
    const active = idx === currentIdx && step !== 'delivered'

    const entry: TimelineEntry = {
      event: step,
      label: STATUS_LABELS[step] || step,
      timestamp: completed || active ? (order[`${step}At`] || order.updatedAt || new Date().toISOString()) : null,
      completed,
      active,
    }

    // Add courier details for assigned step
    if (step === 'assigned' && order.courier && (completed || active)) {
      entry.details = { courierName: shortenName(order.courier.name) }
    }

    return entry
  })
}

function shortenName(name?: string): string {
  if (!name) return 'Kurye'
  const parts = name.trim().split(' ')
  if (parts.length <= 1) return name
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function maskPhone(phone?: string): string {
  if (!phone || phone.length < 6) return '***'
  return phone.slice(0, 3) + 'X XXX XX ' + phone.slice(-2)
}

// ─── GET /:orderId — Track order ─────────────────────────────────
router.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId

    const result = await algoritmaClient.getOrderById(orderId)

    if (!result.success || !result.data) {
      res.status(404).json({ success: false, error: 'Siparis bulunamadi' })
      return
    }

    const order = result.data

    // Get tenant branding
    const projectId = order.projectId
    const tenantConfig = projectId ? tenantConfigStore.get(projectId) : null

    const timeline = mapStatusToTimeline(order)

    res.json({
      success: true,
      data: {
        orderId: order.id || order.orderId,
        status: order.status,
        statusLabel: STATUS_LABELS[order.status] || order.status,
        timeline,
        courier: order.courier
          ? {
              name: shortenName(order.courier.name),
              phone: maskPhone(order.courier.phone),
              location: order.courier.location || null,
            }
          : null,
        estimatedDelivery: order.estimatedDelivery || null,
        branding: {
          projectName: tenantConfig?.projectName || 'Bringo',
          logoUrl: tenantConfig?.logoUrl || null,
          primaryColor: tenantConfig?.primaryColor || '#f97316',
          secondaryColor: tenantConfig?.secondaryColor || '#1a1a2e',
        },
      },
    })

    // SECURITY: No customer address, no order price, courier surname shortened, phone masked
  } catch (err: any) {
    logger.error('Tracking lookup failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to fetch tracking info' })
  }
})

export default router

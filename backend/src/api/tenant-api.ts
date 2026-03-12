/**
 * Tenant (brand) REST API.
 * Protected by tenant-auth middleware.
 * Each brand sees ONLY their own data — tenant isolation enforced here.
 */

import crypto from 'crypto'
import { Router, Request, Response } from 'express'
import { algoritmaClient } from '../services/algoritma-client'
import { config } from '../config/env'
import { logger } from '../utils/logger'

const router = Router()

function maskPhone(phone?: string): string {
  if (!phone || phone.length < 6) return '***'
  return phone.slice(0, 4) + ' XXX XX ' + phone.slice(-2)
}

// ─── POST /orders — Create order ─────────────────────────────────
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!
    const {
      externalOrderId,
      originId,
      deliveryAddress,
      items,
      mode,
      isFrozen,
      deci,
      scheduledSlot,
      metadata,
    } = req.body

    // Validation
    if (!externalOrderId || !originId || !deliveryAddress?.lat || !deliveryAddress?.lng || !deliveryAddress?.customerName || !mode) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: externalOrderId, originId, deliveryAddress (lat, lng, customerName), mode',
      })
      return
    }

    if (!['instant', 'standard', 'flex'].includes(mode)) {
      res.status(400).json({ success: false, error: "Invalid mode. Must be 'instant', 'standard', or 'flex'" })
      return
    }

    // Origin doğrulama — bu branch/origin Algoritma'da var mı?
    const projectResult = await algoritmaClient.getProject(tenant.projectId)
    if (projectResult.success && projectResult.data) {
      const branches = projectResult.data.branches || []
      if (branches.length > 0) {
        const validOrigin = branches.some(
          (b: any) => b.originId === originId || b.id === originId
        )
        if (!validOrigin) {
          res.status(400).json({
            success: false,
            error: `Gecersiz originId: '${originId}'. Bu projenin magazalari: ${branches.map((b: any) => b.originId || b.id).join(', ')}`,
          })
          return
        }
      }
    }

    // Sandbox kontrolü: test key → sandbox flag ekle
    const isSandbox = tenant.isTest || false
    const generatedOrderId = isSandbox
      ? `test_${crypto.randomUUID().slice(0, 12)}`
      : `brg_${crypto.randomUUID().slice(0, 12)}`

    const result = await algoritmaClient.createOrder({
      orderId: generatedOrderId,
      externalOrderId,
      projectId: tenant.projectId,
      originId,
      deliveryLocation: { lat: deliveryAddress.lat, lng: deliveryAddress.lng },
      customerName: deliveryAddress.customerName,
      mode,
      isFrozen,
      deci,
      slotStart: scheduledSlot?.start ? new Date(scheduledSlot.start).getTime() : undefined,
      deadline: scheduledSlot?.end ? new Date(scheduledSlot.end).getTime() : undefined,
      sandbox: isSandbox,
      metadata: { ...metadata, items, customerPhone: deliveryAddress.customerPhone },
    } as any)

    const orderId = result.data?.orderId || generatedOrderId
    const trackingUrl = `${config.portalBaseUrl}/track/${orderId}`

    res.status(201).json({
      success: true,
      data: {
        orderId,
        externalOrderId,
        status: 'pending',
        sandbox: isSandbox,
        trackingUrl,
        estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    })
  } catch (err: any) {
    logger.error('Create order failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to create order' })
  }
})

// ─── GET /orders — List orders ───────────────────────────────────
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!
    const { status, page = '1', limit = '50', from, to } = req.query as Record<string, string>

    const parsedLimit = Math.min(parseInt(limit) || 50, 200)
    const parsedPage = parseInt(page) || 1

    const result = await algoritmaClient.getOrders({ projectId: tenant.projectId, status })

    let orders = Array.isArray(result) ? result : result.data || []

    // Date filter
    if (from) {
      const fromTs = new Date(from).getTime()
      orders = orders.filter((o: any) => (o.createdAt || 0) >= fromTs)
    }
    if (to) {
      const toTs = new Date(to).getTime()
      orders = orders.filter((o: any) => (o.createdAt || 0) <= toTs)
    }

    const total = orders.length
    const start = (parsedPage - 1) * parsedLimit
    const paginatedOrders = orders.slice(start, start + parsedLimit)

    res.json({
      success: true,
      data: { orders: paginatedOrders, total, page: parsedPage, limit: parsedLimit },
    })
  } catch (err: any) {
    logger.error('List orders failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to fetch orders' })
  }
})

// ─── GET /orders/:id — Order detail ─────────────────────────────
router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!
    const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    const result = await algoritmaClient.getOrders({ projectId: tenant.projectId })
    const orders = Array.isArray(result) ? result : result.data || []

    const order = orders.find(
      (o: any) => o.id === orderId || o.orderId === orderId || o.externalOrderId === orderId
    )

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' })
      return
    }

    // Tenant isolation check
    if (order.projectId && order.projectId !== tenant.projectId) {
      res.status(404).json({ success: false, error: 'Order not found' })
      return
    }

    const trackingUrl = `${config.portalBaseUrl}/track/${order.id || order.orderId}`

    res.json({
      success: true,
      data: {
        orderId: order.id || order.orderId,
        externalOrderId: order.externalOrderId || null,
        status: order.status,
        mode: order.mode,
        origin: order.origin || null,
        delivery: {
          location: order.deliveryLocation || order.destination,
          customerName: order.customerName,
          address: order.deliveryAddress || null,
        },
        timeline: order.timeline || [],
        courier: order.courier
          ? {
              name: order.courier.name,
              phone: maskPhone(order.courier.phone),
              location: order.courier.location || null,
            }
          : null,
        trackingUrl,
        estimatedDelivery: order.estimatedDelivery || null,
        pricing: order.pricing || null,
      },
    })
  } catch (err: any) {
    logger.error('Get order detail failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to fetch order' })
  }
})

// ─── POST /orders/:id/cancel — Cancel order ─────────────────────
router.post('/orders/:id/cancel', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!
    const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    // Fetch order to check status
    const result = await algoritmaClient.getOrders({ projectId: tenant.projectId })
    const orders = Array.isArray(result) ? result : result.data || []
    const order = orders.find(
      (o: any) => o.id === orderId || o.orderId === orderId || o.externalOrderId === orderId
    )

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' })
      return
    }

    if (order.projectId && order.projectId !== tenant.projectId) {
      res.status(404).json({ success: false, error: 'Order not found' })
      return
    }

    const status = order.status
    if (status === 'delivered') {
      res.status(400).json({ success: false, error: 'Siparis zaten teslim edildi' })
      return
    }
    if (status === 'assigned' || status === 'picked_up') {
      res.status(400).json({ success: false, error: 'Kurye zaten yolda, iptal edilemez' })
      return
    }

    await algoritmaClient.cancelOrder(order.id || order.orderId)

    res.json({ success: true, data: { orderId: order.id || order.orderId, status: 'cancelled' } })
  } catch (err: any) {
    logger.error('Cancel order failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to cancel order' })
  }
})

// ─── GET /stats — Dashboard KPIs ────────────────────────────────
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!

    const [summary, sla] = await Promise.all([
      algoritmaClient.getTenantSummary(tenant.projectId),
      algoritmaClient.getTenantSLA(tenant.projectId),
    ])

    res.json({
      success: true,
      data: {
        orders: summary.data?.orders || { total: 0, pending: 0, dispatched: 0, delivered: 0, cancelled: 0 },
        routes: summary.data?.routes || { total: 0, active: 0, completed: 0, totalKm: 0 },
        sla: sla.data || { percent: 0, target: 95, isAboveTarget: false, breached: 0, warning: 0 },
        couriers: summary.data?.couriers || { total: 0, idle: 0, busy: 0 },
      },
    })
  } catch (err: any) {
    logger.error('Get tenant stats failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to fetch stats' })
  }
})

// ─── GET /invoices — Invoice info ────────────────────────────────
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!

    const [ordersRes, routesRes, statsRes] = await Promise.all([
      algoritmaClient.getOrders({ projectId: tenant.projectId }),
      algoritmaClient.getRoutes(),
      algoritmaClient.getTenantSummary(tenant.projectId),
    ])

    const orders = ordersRes.success ? (Array.isArray(ordersRes.data) ? ordersRes.data : []) : []
    const routes = routesRes.success ? (Array.isArray(routesRes.data) ? routesRes.data : []) : []

    const totalOrders = orders.length
    const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length

    const perDeliveryPrice = tenant.tier === 'enterprise' ? 2.5 : tenant.tier === 'growth' ? 3.5 : 5.0
    const totalBilled = deliveredOrders * perDeliveryPrice
    const avgCostPerOrder = deliveredOrders > 0 ? Math.round((totalBilled / deliveredOrders) * 100) / 100 : 0

    // Multi-tenant tasarruf tahmini
    const tenantRoutes = routes.filter((r: any) =>
      r.orderIds?.some((oid: string) => orders.find((o: any) => o.id === oid))
    )
    const combinedKm = tenantRoutes.reduce((s: number, r: any) => s + (r.totalDistanceKm || 0), 0)
    const estimatedSeparateKm = combinedKm * 1.2
    const savingsKm = Math.max(0, estimatedSeparateKm - combinedKm)
    const savingsPercent = estimatedSeparateKm > 0 ? Math.round((savingsKm / estimatedSeparateKm) * 100) : 0

    res.json({
      success: true,
      data: {
        projectId: tenant.projectId,
        tier: tenant.tier,
        period: new Date().toISOString().slice(0, 7),
        currentPeriod: {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          end: new Date().toISOString(),
        },
        summary: {
          totalOrders,
          deliveredOrders,
          totalBilled: Math.round(totalBilled * 100) / 100,
          avgCostPerOrder,
          currency: 'TRY',
        },
        multiTenantSavings: {
          combinedKm: Math.round(combinedKm * 100) / 100,
          estimatedSeparateKm: Math.round(estimatedSeparateKm * 100) / 100,
          savingsKm: Math.round(savingsKm * 100) / 100,
          savingsPercent,
          savingsAmount: Math.round(savingsKm * perDeliveryPrice * 0.5 * 100) / 100,
        },
        billingModel: 'per_delivery',
        perDeliveryPrice,
      },
    })
  } catch (err: any) {
    logger.error('Get invoices failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to fetch invoices' })
  }
})

// ─── POST /checkout/options — Checkout widget backend ────────────
router.post('/checkout/options', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!
    const result = await algoritmaClient.getCheckoutOptions({
      ...req.body,
      projectId: tenant.projectId,
    })

    res.json(result)
  } catch (err: any) {
    logger.error('Checkout options failed', { error: err.message })
    res.status(500).json({ success: false, error: 'Failed to fetch checkout options' })
  }
})

export default router

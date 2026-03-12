/**
 * Health check endpoint.
 */

import { Router, Request, Response } from 'express'
import { algoritmaClient } from '../services/algoritma-client'
import { getEventListener } from '../services/event-listener'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  const algoritmaOk = await algoritmaClient.healthCheck()
  const eventListener = getEventListener()

  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      algoritma: algoritmaOk ? 'connected' : 'disconnected',
      eventListener: eventListener?.getStatus() || { connected: false },
    },
  })
})

export default router

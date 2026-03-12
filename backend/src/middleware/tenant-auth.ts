/**
 * Tenant authentication middleware.
 * Validates API key from request headers and attaches tenant info to request.
 */

import { Request, Response, NextFunction } from 'express'
import { validateApiKey } from '../services/api-key-service'

declare global {
  namespace Express {
    interface Request {
      tenant?: {
        projectId: string
        projectName: string
        tier: 'starter' | 'growth' | 'enterprise'
        isTest: boolean
      }
    }
  }
}

function extractApiKey(req: Request): string | null {
  // Check Authorization: Bearer <key>
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Check X-API-Key header
  const xApiKey = req.headers['x-api-key']
  if (typeof xApiKey === 'string') {
    return xApiKey
  }

  return null
}

export function tenantAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = extractApiKey(req)

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'API key required. Send via Authorization: Bearer <key> or X-API-Key header',
    })
    return
  }

  const result = validateApiKey(apiKey)

  if (!result.valid || !result.record) {
    if (result.error === 'Rate limit exceeded') {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: 60,
      })
      return
    }

    if (result.error === 'API key revoked') {
      res.status(401).json({
        success: false,
        error: 'API key has been revoked',
      })
      return
    }

    res.status(401).json({
      success: false,
      error: 'Invalid API key',
    })
    return
  }

  req.tenant = {
    projectId: result.record.projectId,
    projectName: result.record.projectName,
    tier: result.record.tier,
    isTest: result.record.isTest,
  }

  next()
}

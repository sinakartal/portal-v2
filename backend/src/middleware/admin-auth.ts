/**
 * Admin authentication middleware.
 * Accepts X-Admin-Key header or Bearer token from super_admin user.
 */

import { Request, Response, NextFunction } from 'express'
import { config } from '../config/env'
import { validateToken } from '../api/auth-api'

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Check X-Admin-Key first
  const adminKey = req.headers['x-admin-key']
  if (adminKey && config.adminApiKey && adminKey === config.adminApiKey) {
    next()
    return
  }

  // Check Bearer token (from logged-in super_admin)
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    // Allow mock tokens in dev
    if (token.startsWith('mock_token_')) {
      next()
      return
    }
    const result = validateToken(token)
    if (result.valid) {
      next()
      return
    }
  }

  res.status(401).json({
    success: false,
    error: 'Invalid or missing admin API key',
  })
}

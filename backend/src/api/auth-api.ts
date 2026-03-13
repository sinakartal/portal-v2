/**
 * Auth API — login and token verification endpoints.
 * Uses simple crypto-based tokens (no JWT dependency needed).
 * FileStore ile kalici depolama — restart'ta veri korunur.
 */

import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import { config } from '../config/env'
import { logger } from '../utils/logger'
import { FileStore } from '../utils/file-store'

const router = Router()

// FileStore ile kalici user ve token store
const users = new FileStore<{
  _id: string
  email: string
  firstName: string
  lastName: string
  role: string
  permissions: string[]
  passwordHash: string
}>('auth-users')

const tokens = new FileStore<{ userId: string; createdAt: number }>('auth-tokens')

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + config.jwtSecret).digest('hex')
}

function generateToken(): string {
  return 'brg_tok_' + crypto.randomBytes(32).toString('hex')
}

// Seed default users — sadece bossa seed et (restart'ta tekrar yazma)
function seedUsers() {
  if (users.size > 0) return

  const defaultUsers = [
    { _id: '1', email: 'sina@bringo.com', firstName: 'Sina', lastName: 'Kartal', role: 'super_admin', permissions: ['*'], password: '123456' },
    { _id: '1b', email: 'admin@bringo.com', firstName: 'Admin', lastName: 'Bringo', role: 'super_admin', permissions: ['*'], password: '123456' },
    { _id: '2', email: 'manager@bringo.com', firstName: 'Manager', lastName: 'User', role: 'manager', permissions: ['orders:read', 'orders:create', 'orders:update', 'orders:assign', 'orders:bulk_import', 'couriers:read', 'couriers:track', 'routes:read', 'routes:create', 'routes:optimize', 'analytics:read', 'analytics:export', 'finance:read'], password: '123456' },
    { _id: '3', email: 'operator@bringo.com', firstName: 'Operator', lastName: 'User', role: 'operator', permissions: ['orders:read', 'orders:create', 'orders:update', 'couriers:read', 'couriers:track'], password: '123456' },
    { _id: '4', email: 'dispatcher@bringo.com', firstName: 'Dispatcher', lastName: 'User', role: 'dispatcher', permissions: ['orders:read', 'orders:create', 'orders:update', 'orders:assign', 'couriers:read', 'couriers:track', 'routes:read', 'routes:create'], password: '123456' },
  ]
  for (const u of defaultUsers) {
    const { password, ...userData } = u
    users.set(u.email, { ...userData, passwordHash: hashPassword(password) })
  }
  // Also allow login with 'sina' as identifier
  const sinaUser = users.get('sina@bringo.com')
  if (sinaUser) users.set('sina', sinaUser)
}

// Eski tokenlari temizle (7 gun)
function cleanExpiredTokens() {
  const EXPIRY = 7 * 24 * 60 * 60 * 1000
  const now = Date.now()
  for (const [tokenKey, data] of tokens.entries()) {
    if (now - data.createdAt > EXPIRY) {
      tokens.delete(tokenKey)
    }
  }
}

seedUsers()
cleanExpiredTokens()

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email ve sifre gerekli' })
    return
  }

  const user = users.get(email)
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ success: false, error: 'E-posta veya sifre hatali' })
    return
  }

  const token = generateToken()
  tokens.set(token, { userId: user._id, createdAt: Date.now() })

  const { passwordHash, ...safeUser } = user
  logger.info('User logged in', { email, role: user.role })

  res.json({
    success: true,
    token,
    user: safeUser,
  })
})

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Token gerekli' })
    return
  }

  const token = authHeader.substring(7)
  const tokenData = tokens.get(token)
  if (!tokenData) {
    res.status(401).json({ success: false, error: 'Gecersiz token' })
    return
  }

  // Find user by id
  let foundUser: any = null
  for (const [, u] of users.entries()) {
    if (u._id === tokenData.userId) {
      const { passwordHash, ...safeUser } = u
      foundUser = safeUser
      break
    }
  }

  if (!foundUser) {
    res.status(401).json({ success: false, error: 'Kullanici bulunamadi' })
    return
  }

  res.json({ success: true, user: foundUser })
})

// Helper: validate token (exported for middleware use)
export function validateToken(token: string): { valid: boolean; userId?: string } {
  const data = tokens.get(token)
  if (!data) return { valid: false }
  return { valid: true, userId: data.userId }
}

export default router

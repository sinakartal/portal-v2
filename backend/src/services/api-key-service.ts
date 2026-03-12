/**
 * API Key generation, validation, and management service.
 * Each tenant (brand) gets an API key to access Portal API.
 * Keys are stored as SHA256 hashes — plain keys are NEVER stored.
 */

import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { TenantApiKeyRecord, TenantTier, TIER_RATE_LIMITS } from '../models/portal-types'
import { logger } from '../utils/logger'

// In-memory stores
const keyStore = new Map<string, TenantApiKeyRecord>()       // keyHash → record
const projectKeyMap = new Map<string, string>()               // projectId → keyHash

function hashKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

function getCurrentMinute(): number {
  return Math.floor(Date.now() / 60000)
}

export function generateApiKey(
  projectId: string,
  projectName: string,
  tier: TenantTier,
  isTest: boolean = false
): { apiKey: string; record: TenantApiKeyRecord } {
  // Revoke existing key for this project
  if (projectKeyMap.has(projectId)) {
    revokeApiKey(projectId)
  }

  const prefix = isTest ? 'brg_test_' : 'brg_live_'
  const randomPart = crypto.randomBytes(16).toString('hex')
  const apiKey = `${prefix}${randomPart}`
  const hash = hashKey(apiKey)

  const record: TenantApiKeyRecord = {
    id: uuidv4(),
    projectId,
    projectName,
    keyHash: hash,
    keyPrefix: apiKey.substring(0, 16) + '...',
    tier,
    isTest,
    rateLimit: TIER_RATE_LIMITS[tier],
    createdAt: Date.now(),
    lastUsedAt: 0,
    requestsThisMinute: 0,
    minuteStart: getCurrentMinute(),
    isRevoked: false,
  }

  keyStore.set(hash, record)
  projectKeyMap.set(projectId, hash)

  logger.info('API key generated', { projectId, projectName, tier, isTest, prefix: record.keyPrefix })

  // Plain key is ONLY returned here — never accessible again
  return { apiKey, record }
}

export function validateApiKey(apiKey: string): {
  valid: boolean
  record?: TenantApiKeyRecord
  error?: string
} {
  const hash = hashKey(apiKey)
  const record = keyStore.get(hash)

  if (!record) {
    return { valid: false, error: 'Invalid API key' }
  }

  if (record.isRevoked) {
    return { valid: false, error: 'API key revoked' }
  }

  // Rate limit check
  const currentMinute = getCurrentMinute()
  if (currentMinute !== record.minuteStart) {
    record.requestsThisMinute = 0
    record.minuteStart = currentMinute
  }

  if (record.requestsThisMinute >= record.rateLimit) {
    return { valid: false, error: 'Rate limit exceeded' }
  }

  record.requestsThisMinute++
  record.lastUsedAt = Date.now()

  return { valid: true, record }
}

export function revokeApiKey(projectId: string): boolean {
  const hash = projectKeyMap.get(projectId)
  if (!hash) return false

  const record = keyStore.get(hash)
  if (!record) return false

  record.isRevoked = true
  logger.info('API key revoked', { projectId })
  return true
}

export function getKeyInfo(projectId: string): Omit<TenantApiKeyRecord, 'keyHash'> | null {
  const hash = projectKeyMap.get(projectId)
  if (!hash) return null

  const record = keyStore.get(hash)
  if (!record) return null

  const { keyHash, ...info } = record
  return info
}

export function getAllKeys(): Omit<TenantApiKeyRecord, 'keyHash'>[] {
  return Array.from(keyStore.values()).map(({ keyHash, ...rest }) => rest)
}

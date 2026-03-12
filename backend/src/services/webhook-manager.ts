/**
 * Outbound webhook manager.
 * When Algoritma emits an event, Portal sends POST to the tenant's webhook URL.
 */

import { v4 as uuidv4 } from 'uuid'
import { TenantWebhookConfig, WebhookDeliveryResult, WebhookLog } from '../models/portal-types'
import { createHmacSignature } from '../utils/hmac'
import { logger } from '../utils/logger'

// In-memory stores
const webhookStore = new Map<string, TenantWebhookConfig>()
const webhookLogs: WebhookLog[] = []
const MAX_LOGS = 500

export function registerWebhook(config: TenantWebhookConfig): void {
  webhookStore.set(config.projectId, config)
  logger.info('Webhook registered', { projectId: config.projectId, url: config.callbackUrl })
}

export function updateWebhook(projectId: string, patch: Partial<TenantWebhookConfig>): void {
  const existing = webhookStore.get(projectId)
  if (existing) {
    Object.assign(existing, patch)
    logger.info('Webhook updated', { projectId })
  }
}

export function getWebhook(projectId: string): TenantWebhookConfig | undefined {
  return webhookStore.get(projectId)
}

export function removeWebhook(projectId: string): boolean {
  const existed = webhookStore.delete(projectId)
  if (existed) {
    logger.info('Webhook removed', { projectId })
  }
  return existed
}

export async function sendWebhook(
  projectId: string,
  event: string,
  payload: any
): Promise<WebhookDeliveryResult> {
  const config = webhookStore.get(projectId)
  const webhookId = uuidv4()
  const startTime = Date.now()

  // No config or inactive
  if (!config || !config.isActive) {
    return {
      success: false,
      webhookId,
      event,
      statusCode: null,
      duration: 0,
      error: config ? 'Webhook inactive' : 'No webhook configured',
      mock: true,
    }
  }

  // Event not subscribed
  if (!config.events.includes(event) && event !== 'test') {
    return {
      success: false,
      webhookId,
      event,
      statusCode: null,
      duration: 0,
      error: `Event '${event}' not in subscribed events`,
      mock: true,
    }
  }

  const webhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    webhookId,
    data: payload,
  }

  const payloadStr = JSON.stringify(webhookPayload)
  const signature = createHmacSignature(config.secret, payloadStr)

  // MOCK MODE: Log instead of real HTTP call
  // When ready for production, uncomment the fetch block below
  logger.info('Webhook send (MOCK)', {
    projectId,
    event,
    webhookId,
    callbackUrl: config.callbackUrl,
    signature: `sha256=${signature}`,
  })

  /*
  // REAL HTTP CALL (uncomment when ready)
  try {
    const response = await fetch(config.callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bringo-Signature': `sha256=${signature}`,
        'X-Bringo-Event': event,
        'X-Bringo-Webhook-Id': webhookId,
        'X-Bringo-Timestamp': webhookPayload.timestamp,
      },
      body: payloadStr,
      signal: AbortSignal.timeout(10000),
    })

    const duration = Date.now() - startTime
    const result: WebhookDeliveryResult = {
      success: response.ok,
      webhookId,
      event,
      statusCode: response.status,
      duration,
      mock: false,
    }

    if (response.ok) {
      config.failureCount = 0
      config.lastSuccess = Date.now()
    } else {
      config.failureCount++
      config.lastFailure = Date.now()
      result.error = `HTTP ${response.status}`
      if (config.failureCount >= 5) {
        config.isActive = false
        logger.warn('Webhook auto-disabled after 5 failures', { projectId })
      }
    }

    addLog(projectId, event, webhookId, webhookPayload, result)
    return result
  } catch (err: any) {
    const duration = Date.now() - startTime
    config.failureCount++
    config.lastFailure = Date.now()

    if (config.failureCount >= 5) {
      config.isActive = false
      logger.warn('Webhook auto-disabled after 5 failures', { projectId })
    }

    const result: WebhookDeliveryResult = {
      success: false,
      webhookId,
      event,
      statusCode: null,
      duration,
      error: err.message,
      mock: false,
    }

    addLog(projectId, event, webhookId, webhookPayload, result)
    return result
  }
  */

  const duration = Date.now() - startTime
  const result: WebhookDeliveryResult = {
    success: true,
    webhookId,
    event,
    statusCode: 200,
    duration,
    mock: true,
  }

  config.lastSuccess = Date.now()
  config.failureCount = 0

  addLog(projectId, event, webhookId, webhookPayload, result)
  return result
}

function addLog(
  projectId: string,
  event: string,
  webhookId: string,
  payload: any,
  result: WebhookDeliveryResult
): void {
  webhookLogs.push({
    id: uuidv4(),
    projectId,
    event,
    webhookId,
    payload,
    result,
    timestamp: Date.now(),
  })

  // Keep only last MAX_LOGS entries
  if (webhookLogs.length > MAX_LOGS) {
    webhookLogs.splice(0, webhookLogs.length - MAX_LOGS)
  }
}

export function getWebhookLogs(projectId: string, limit: number = 50): WebhookLog[] {
  return webhookLogs
    .filter((log) => log.projectId === projectId)
    .slice(-limit)
}

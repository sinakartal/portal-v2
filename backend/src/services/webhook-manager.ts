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
  payload: any,
  retryCount = 0
): Promise<WebhookDeliveryResult> {
  const config = webhookStore.get(projectId)
  const webhookId = uuidv4()
  const startTime = Date.now()

  if (!config || !config.isActive) {
    return { success: false, webhookId, event, statusCode: null, duration: 0,
      error: config ? 'Webhook inactive' : 'No webhook configured', mock: false }
  }

  if (!config.events.includes(event) && event !== 'test') {
    return { success: false, webhookId, event, statusCode: null, duration: 0,
      error: `Event '${event}' not subscribed`, mock: false }
  }

  const webhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    webhookId,
    data: payload,
  }

  const payloadStr = JSON.stringify(webhookPayload)
  const signature = createHmacSignature(config.secret, payloadStr)

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
      success: response.ok, webhookId, event,
      statusCode: response.status, duration, mock: false,
    }

    if (response.ok) {
      config.failureCount = 0
      config.lastSuccess = Date.now()
      logger.info('Webhook delivered', { projectId, event, status: response.status, duration })
    } else {
      config.failureCount++
      config.lastFailure = Date.now()
      result.error = `HTTP ${response.status}`

      // Retry: 3 deneme, exponential backoff (5s, 30s, 120s)
      const RETRY_DELAYS = [5000, 30000, 120000]
      if (retryCount < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[retryCount]
        logger.warn(`Webhook failed, retry ${retryCount + 1}/3 in ${delay/1000}s`, { projectId, event })
        setTimeout(() => sendWebhook(projectId, event, payload, retryCount + 1), delay)
      } else {
        logger.error('Webhook max retries reached', { projectId, event })
        if (config.failureCount >= 10) {
          config.isActive = false
          logger.warn('Webhook auto-disabled after 10 failures', { projectId })
        }
      }
    }

    addLog(projectId, event, webhookId, webhookPayload, result)
    return result
  } catch (err: any) {
    const duration = Date.now() - startTime
    config.failureCount++
    config.lastFailure = Date.now()

    const result: WebhookDeliveryResult = {
      success: false, webhookId, event, statusCode: null, duration,
      error: err.message, mock: false,
    }

    // Network hatasinda da retry yap
    const RETRY_DELAYS = [5000, 30000, 120000]
    if (retryCount < RETRY_DELAYS.length) {
      const delay = RETRY_DELAYS[retryCount]
      logger.warn(`Webhook network error, retry ${retryCount + 1}/3 in ${delay/1000}s`, { projectId, event })
      setTimeout(() => sendWebhook(projectId, event, payload, retryCount + 1), delay)
    }

    addLog(projectId, event, webhookId, webhookPayload, result)
    return result
  }
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

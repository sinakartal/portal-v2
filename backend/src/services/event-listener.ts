/**
 * Algoritma SSE event listener.
 * Connects to Algoritma's SSE stream, parses events,
 * and forwards them to webhook-manager for outbound delivery.
 *
 * Features:
 * - WebhookManager dependency injection
 * - Configurable reconnect with max attempts
 * - Extended event mapping (courier:assigned, order:pooled, etc.)
 */

import { logger } from '../utils/logger'
import * as webhookManager from './webhook-manager'

interface EventListenerStatus {
  connected: boolean
  lastEventAt: number
  eventsProcessed: number
  reconnectAttempts: number
  lastError: string | null
}

interface ReconnectConfig {
  baseDelay: number      // ms — initial delay
  maxDelay: number       // ms — max backoff
  maxAttempts: number    // 0 = unlimited
}

const DEFAULT_RECONNECT: ReconnectConfig = {
  baseDelay: 3000,
  maxDelay: 30000,
  maxAttempts: 0, // unlimited
}

// Algoritma event → Webhook event mapping
const STATUS_EVENT_MAP: Record<string, string> = {
  pending: 'order.created',
  dispatched: 'order.dispatched',
  assigned: 'order.assigned',
  picked_up: 'order.picked_up',
  in_transit: 'order.in_transit',
  delivered: 'order.delivered',
  cancelled: 'order.cancelled',
}

export class AlgoritmaEventListener {
  private algoritmaUrl: string
  private reconnectConfig: ReconnectConfig
  private status: EventListenerStatus = {
    connected: false,
    lastEventAt: 0,
    eventsProcessed: 0,
    reconnectAttempts: 0,
    lastError: null,
  }
  private abortController: AbortController | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  constructor(algoritmaUrl: string, reconnectConfig?: Partial<ReconnectConfig>) {
    this.algoritmaUrl = algoritmaUrl
    this.reconnectConfig = { ...DEFAULT_RECONNECT, ...reconnectConfig }
  }

  async connect(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort()
    }

    this.abortController = new AbortController()
    const url = `${this.algoritmaUrl}/api/webhook/stream`

    logger.info('Connecting to Algoritma SSE stream', { url })

    try {
      const response = await fetch(url, {
        headers: { Accept: 'text/event-stream' },
        signal: this.abortController.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(`SSE connection failed: HTTP ${response.status}`)
      }

      this.status.connected = true
      this.status.reconnectAttempts = 0
      this.status.lastError = null
      logger.info('Connected to Algoritma SSE stream')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let currentEvent = ''
        let currentData = ''

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            currentData = line.slice(5).trim()
          } else if (line === '' && currentData) {
            this.processEvent(currentEvent, currentData)
            currentEvent = ''
            currentData = ''
          }
        }
      }

      // Stream ended cleanly
      this.status.connected = false
      logger.info('SSE stream ended, reconnecting...')
      this.scheduleReconnect()
    } catch (err: any) {
      if (err.name === 'AbortError') return

      this.status.connected = false
      this.status.lastError = err.message
      logger.warn('SSE connection lost', { error: err.message, attempt: this.status.reconnectAttempts })
      this.scheduleReconnect()
    }
  }

  private processEvent(eventType: string, rawData: string): void {
    try {
      const data = JSON.parse(rawData)
      this.status.lastEventAt = Date.now()
      this.status.eventsProcessed++

      // Connected event — skip
      if (data.type === 'connected') return

      const projectId = data.projectId || data.data?.projectId
      if (!projectId) return

      let webhookEvent: string | null = null
      let webhookPayload: any = data

      // ─── Order status changed ─────────────────────────
      if (eventType === 'order:status_changed' && data.newStatus) {
        webhookEvent = STATUS_EVENT_MAP[data.newStatus] || null
        webhookPayload = {
          orderId: data.orderId,
          oldStatus: data.oldStatus,
          newStatus: data.newStatus,
          projectId,
          timestamp: data.timestamp || Date.now(),
        }
      }

      // ─── Courier assigned ─────────────────────────────
      else if (eventType === 'courier:assigned') {
        webhookEvent = 'courier.assigned'
        webhookPayload = {
          orderId: data.orderId,
          courierId: data.courierId,
          courierName: data.courierName,
          projectId,
          timestamp: data.timestamp || Date.now(),
        }
      }

      // ─── Order pooled (zone dispatch) ─────────────────
      else if (eventType === 'order:pooled') {
        webhookEvent = 'order.pooled'
        webhookPayload = {
          orderId: data.orderId,
          zone: data.zone,
          projectId,
          timestamp: data.timestamp || Date.now(),
        }
      }

      // ─── Order picked up ──────────────────────────────
      else if (eventType === 'order:picked_up') {
        webhookEvent = 'order.picked_up'
      }

      // ─── SLA events ───────────────────────────────────
      else if (eventType === 'order:sla_warning') {
        webhookEvent = 'order.sla_warning'
      } else if (eventType === 'order:sla_breach') {
        webhookEvent = 'order.sla_breach'
      }

      // ─── Route created ────────────────────────────────
      else if (eventType === 'route:created') {
        webhookEvent = 'route.created'
      }

      // Send webhook
      if (webhookEvent) {
        webhookManager.sendWebhook(projectId, webhookEvent, webhookPayload).catch((err) => {
          logger.error('Webhook send failed', { projectId, event: webhookEvent, error: err.message })
        })
      }
    } catch {
      logger.warn('Failed to parse SSE event data', { eventType, rawData })
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return

    const { baseDelay, maxDelay, maxAttempts } = this.reconnectConfig

    // Check max attempts
    if (maxAttempts > 0 && this.status.reconnectAttempts >= maxAttempts) {
      logger.error('SSE max reconnect attempts reached, giving up', {
        attempts: this.status.reconnectAttempts,
      })
      return
    }

    // Exponential backoff with jitter
    const attempt = this.status.reconnectAttempts
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay) + Math.random() * 1000
    this.status.reconnectAttempts++

    logger.info('SSE reconnecting', { delay: `${Math.round(delay)}ms`, attempt: this.status.reconnectAttempts })

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  disconnect(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.status.connected = false
  }

  getStatus(): EventListenerStatus {
    return { ...this.status }
  }
}

let instance: AlgoritmaEventListener | null = null

export function startEventListener(algoritmaUrl: string): AlgoritmaEventListener {
  if (instance) {
    instance.disconnect()
  }
  instance = new AlgoritmaEventListener(algoritmaUrl)
  instance.connect()
  return instance
}

export function getEventListener(): AlgoritmaEventListener | null {
  return instance
}

/**
 * HMAC-SHA256 signature utility for webhook signing.
 */

import crypto from 'crypto'

export function createHmacSignature(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function verifyHmacSignature(secret: string, payload: string, signature: string): boolean {
  const expected = createHmacSignature(secret, payload)
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

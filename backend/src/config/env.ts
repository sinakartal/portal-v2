/**
 * Environment configuration.
 * Loads .env and exports typed config object.
 */

import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  algoritmaUrl: process.env.ALGORITMA_URL || 'http://localhost:3001',
  adminApiKey: process.env.ADMIN_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'change_me_in_production_' + Math.random().toString(36),
  portalBaseUrl: process.env.PORTAL_BASE_URL || 'http://localhost:3002',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
}

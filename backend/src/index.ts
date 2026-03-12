/**
 * Application entry point.
 * Loads environment, starts server.
 */

import { startServer } from './server'

startServer().catch((err) => {
  console.error('Failed to start Portal server:', err)
  process.exit(1)
})

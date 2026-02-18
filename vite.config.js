import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Subdomain support: corporate.localhost, restaurant.localhost, ship.localhost
    host: true,
    allowedHosts: [
      'localhost',
      'corporate.localhost',
      'restaurant.localhost',
      'ship.localhost',
    ],
  },
})

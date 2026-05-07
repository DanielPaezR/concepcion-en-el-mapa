import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: 'Concepción en el Mapa - Turista',
        short_name: 'Concepción Turista',
        description: 'Descubre Concepción con nuestros guías locales',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        theme_color: '#3B82F6',
        background_color: '#FFFFFF',
        categories: ['travel', 'lifestyle'],
        screenshots: [
          {
            src: '/icons/screenshot-1.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/icons/screenshot-2.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutos
              }
            }
          }
        ]
      },
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js'
    })
  ],
  server: { port: 5173, open: true },
  build: { outDir: 'dist' }
})
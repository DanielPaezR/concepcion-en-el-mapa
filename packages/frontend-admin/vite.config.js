import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: 'Concepción en el Mapa - Admin',
        short_name: 'Concepción Admin',
        description: 'Panel administrativo de Concepción en el Mapa',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        theme_color: '#1F2937',
        background_color: '#FFFFFF',
        categories: ['productivity', 'business'],
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
  server: { port: 5174, open: true },
  build: { outDir: 'dist' }
})
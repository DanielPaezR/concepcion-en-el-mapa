import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Concepción en el Mapa - Explorador',
        short_name: 'ConceMap',
        description: 'Descubre y explora la belleza de Concepción, Antioquia',
        theme_color: '#16a34a',
        background_color: '#020612',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ],
        shortcuts: [
          { name: 'Mapa', short_name: 'Mapa', url: '/mapa', icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] },
          { name: 'Mis Reservas', short_name: 'Reservas', url: '/mis-reservas', icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'mapbox-cache', expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 } }
          },
          {
            urlPattern: /^https:\/\/backend-production-ceem\.up\.railway\.app\/api\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 10, expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 } }
          }
        ]
      }
    })
  ],
  build: { outDir: 'dist' }
})
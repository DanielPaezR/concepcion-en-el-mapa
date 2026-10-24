import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'generateSW',
      manifest: {
        name: 'Concepción en el Mapa - Turista',
        short_name: 'Concepción',
        description: 'Descubre Concepción con nuestros guías locales',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        orientation: 'portrait',
        categories: ['travel', 'lifestyle'],
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        runtimeCaching: [
          // Estilo, íconos y fuentes del mapa: casi nunca cambian, así que se
          // sirven del celular y se actualizan por detrás. Las teselas (v4/...)
          // no pasan por aquí: mapbox-gl ya las guarda en su propio caché.
          // (Antes una regla /^https:\/\/api\./ atrapaba todas las teselas de
          // api.mapbox.com en un caché de 50 entradas y 5 minutos.)
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/(styles|fonts)\/v1\//i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'mapbox-estilo',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 7 * 24 * 60 * 60
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/events\.mapbox\.com\/.*/i,
            handler: 'NetworkOnly',
            options: {}
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/_/]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: { outDir: 'dist' }
})
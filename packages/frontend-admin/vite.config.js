import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // 🔥 Cambiar de injectManifest a generateSW
      strategies: 'generateSW',
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
                maxAgeSeconds: 5 * 60
              }
            }
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/_/, /\/site\.webmanifest$/]
      },
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
  server: { port: 5174, open: true },
  build: { outDir: 'dist' }
})
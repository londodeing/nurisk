import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false
      },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'mask-icon.svg',
        'robots.txt'
      ],
      manifest: {
        name: 'NURisk',
        short_name: 'NURisk',
        description: 'Sistem Manajemen Bencana NU Peduli',
        theme_color: '#006432',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        lang: 'id',
        categories: ['news', 'social', 'utilities'],
        share_target: {
          action: '/lapor',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'image',
                accept: ['image/*']
              }
            ]
          }
        },
        shortcuts: [
          {
            name: 'Lapor Bencana',
            short_name: 'Lapor',
            description: 'Lapor kejadian bencana',
            url: '/lapor',
            icons: [{ src: '/icons/shortcut-lapor.png', sizes: '96x96' }]
          },
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Dashboard publik',
            url: '/dashboard',
            icons: [{ src: '/icons/shortcut-dashboard.png', sizes: '96x96' }]
          },
          {
            name: 'Peta',
            short_name: 'Peta',
            description: 'Peta kejadian bencana',
            url: '/map',
            icons: [{ src: '/icons/shortcut-map.png', sizes: '96x96' }]
          }
        ],
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf}'],
        globIgnores: [
          '**/node_modules/**/*',
          '**/service-worker.js',
          '**/manifest.webmanifest'
        ],
        navigateFallback: '/offline.html',
        runtimeCaching: [
          // API responses with NetworkFirst
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Map tiles with CacheFirst
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Font files with CacheFirst
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Uploaded images with StaleWhileRevalidate
          {
            urlPattern: /^https:\/\/.*\/uploads\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'uploads-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Static assets with CacheFirst
          {
            urlPattern: /^https:\/\/.*\.(js|css|png|jpg|jpeg|svg|gif|ico|woff2)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react-leaflet': 'react-leaflet',
      '@': path.resolve(__dirname, './src')
    }
  },
  // ─── Dev Server Config ────────────────────────────────────────────────────
  server: {
    port: 5173,
    host: true, // Bisa diakses dari luar (misal via HP di LAN yang sama)
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/socket.io': { target: 'http://localhost:3000', ws: true, changeOrigin: true }
    }
  },
  // ─── Build Optimization ─────────────────────────────────────────────────────
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Minify with terser for better compression
    minify: 'terser',
    // Generate sourcemap for debugging
    sourcemap: false,
    // Chunk size warning limit (500KB)
    chunkSizeWarningLimit: 500,
    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better splitting
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Map library
          'map-vendor': ['react-leaflet', 'leaflet'],
          // Charts
          'charts-vendor': ['recharts'],
        },
      },
    },
    // Terser options for better compression
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      format: {
        comments: false,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@nurisk/sdk'],
  },
});
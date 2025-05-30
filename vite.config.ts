import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      srcDir: 'src',
      registerType: 'autoUpdate',
      injectRegister: 'script',
      manifest: {
        name: 'Blood Lab Flashcards',
        short_name: 'Blood Lab FC',
        description: '血液検査の基準値を学ぶためのフラッシュカードアプリ',
        start_url: './',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1f2937',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/blood-lab-flashcards/',
})

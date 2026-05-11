import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  // 讀 root .env (單一來源)
  envDir: path.resolve(__dirname, '..'),
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3000',
      // socket.io 走 /socket.io/*，要單獨 proxy 並開 ws: true 才能升級 WebSocket
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        ws: true,
      },
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  build: {
    target: 'esnext',
    outDir: '../backend/public',
    emptyOutDir: true,
  },
})

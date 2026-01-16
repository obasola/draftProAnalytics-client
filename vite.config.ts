// File: vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'


export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
  },
  // For dev mode, source maps are enabled by default in Vite 5
  // but you can explicitly ensure it:
  css: {
    devSourcemap: true,
  },
server: {
    port: 5173,
    open: false,
    watch: {
      usePolling: true,
      interval: 150,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
})


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
  server: {
    port: 8080,
    open: true,
    watch: {
      usePolling: true,
      interval: 150,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
})
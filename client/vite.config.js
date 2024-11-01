import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/numerical-method': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})

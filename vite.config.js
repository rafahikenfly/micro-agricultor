import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@domain": new URL('./shared/domain', import.meta.url).pathname,
      "@infra": new URL('./shared/infra', import.meta.url).pathname,
      "@shared": new URL('./shared', import.meta.url).pathname,
    }
  }
})

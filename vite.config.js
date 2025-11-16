import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.VITE_PUBLIC_BASE || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Fuerza reinicio seguro de servidor local
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
})
// Restauración y despliegue de la versión del 8 de julio (15/07/2026)
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
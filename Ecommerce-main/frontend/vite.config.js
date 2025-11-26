import { defineConfig } from 'vite' // función oficial de Vite para validar la configuración.
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // activa el plugin de React (@vitejs/plugin-react) que instalaste.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },  
  test: {
    globals: true,              // Nos permite usar describe, it, expect sin importarlos siempre
    environment: 'jsdom',       // Simula un navegador para que React funcione en las pruebas
    setupFiles: './src/tests/setup.js', // Archivo que crearemos en el siguiente paso
    css: false,                 // Desactiva el CSS en los tests para que sean más rápidos
  },
  server: {
    port: 5173, // especifica el puerto (5173 por defecto).
    open: true, // hace que se abra el navegador automáticamente cuando corras npm run dev
  },
})
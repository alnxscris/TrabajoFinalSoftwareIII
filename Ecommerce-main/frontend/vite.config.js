import { defineConfig } from 'vite' // función oficial de Vite para validar la configuración.
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // activa el plugin de React (@vitejs/plugin-react) que instalaste.
  server: {
    port: 5173, // especifica el puerto (5173 por defecto).
    open: true, // hace que se abra el navegador automáticamente cuando corras npm run dev
  },
})
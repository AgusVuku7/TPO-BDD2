import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,         // Permite que el contenedor reciba conexiones externas
    port: 5173,         // Asegura que use el puerto que mapeaste en el compose
    watch: {
      usePolling: true, // Obligatorio para que Windows detecte cambios en Docker
    },
  },
})
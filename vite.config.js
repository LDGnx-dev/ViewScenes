import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl' // Importa el plugin

export default defineConfig({
  plugins: [react(), glsl()] // Añádelo a los plugins
})
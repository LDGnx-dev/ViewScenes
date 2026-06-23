import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl' // Importa el plugin

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), glsl(), cloudflare()] // Añádelo a los plugins
})
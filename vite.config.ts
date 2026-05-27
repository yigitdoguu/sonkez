import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sonkez/', // GitHub Pages'te /sonkez/ alt klasöründen yüklenmesi için
})
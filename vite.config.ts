import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pdfPlugin } from './server/pdf.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pdfPlugin()],
})

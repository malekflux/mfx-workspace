import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pdfPlugin } from './server/pdf.js' // أو المسار الذي يتواجد فيه ملف pdf.ts

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pdfPlugin()],
})

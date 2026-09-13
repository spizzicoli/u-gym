import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use 'src/styles/variables' as *;`
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})

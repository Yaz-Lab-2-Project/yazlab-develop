import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // /api ile başlayan istekleri http://127.0.0.1:8000'e yönlendir
      '/api': {
        target: 'http://127.0.0.1:8000', // Backend adresiniz
        changeOrigin: true, // Önerilir
        // secure: false, // Eğer backend https ve sertifika sorunlu ise
      }
    }
  }
})
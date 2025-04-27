import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // /api ile başlayan istekleri backend'e yönlendir
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // secure: false, // HTTPS + self-signed sertifika ise açılabilir
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Base URL boş, tüm yollar göreceli => index.html'de <link href="assets/…"> olarak kullanılır
  base: '',
})

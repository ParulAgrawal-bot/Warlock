import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/piston-api': {
        target: 'http://127.0.0.1:2000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/piston-api/, '/api/v2'),
      },
    },
  },
  preview: {
    proxy: {
      '/piston-api': {
        target: 'http://127.0.0.1:2000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/piston-api/, '/api/v2'),
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['monaco-editor']
  },
  ssr: {
    external: ['ws']
  }
})


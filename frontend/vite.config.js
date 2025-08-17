import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: (id) => {
        if (id.includes('@safe-globalThis/safe-apps-provider') || 
            id.includes('@safe-globalThis/safe-apps-sdk') ||
            id.includes('@safe-global/safe-apps-provider') || 
            id.includes('@safe-global/safe-apps-sdk')) {
          return true;
        }
        return false;
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['ethers', 'wagmi', '@rainbow-me/rainbowkit'],
          charts: ['recharts']
        },
        paths: {
          '@safe-globalThis/safe-apps-provider': './node_modules/@safe-global/safe-apps-provider',
          '@safe-globalThis/safe-apps-sdk': './node_modules/@safe-global/safe-apps-sdk'
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  },
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    },
    // Ignorar warnings de TypeScript/ESLint durante build
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true
  },
  // Configurações para ignorar warnings
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})

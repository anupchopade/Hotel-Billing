import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['lucide-react'],
  },
  build: {
    // Optimize build for production
    minify: 'esbuild', // Changed from 'terser' to 'esbuild' (faster and included)
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
        },
      },
    },
    // Reduce bundle size
    chunkSizeWarningLimit: 1000,
  },
  // Server configuration for preview
  preview: {
    port: 4173,
    host: true,
  },
});
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    dedupe: ['react', 'react-dom'], // запобігає дубляжу
  },
  // optimizeDeps: {
  //   include: ['@reelo/ui-web'],
  // },
  define: {
    'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL),
  },
  build: {
    rollupOptions: {
      external: ['embla-carousel-react']
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, '..'),
  envPrefix: ['VITE_', 'API_'],
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['pdfjs-dist']
  },
  assetsInclude: ['**/*.jpeg', '**/*.jpg', '**/*.png', '**/*.gif'],
  define: {
    global: 'globalThis',
  },
  server: {
    host: true, // Exposes server to both localhost and local network IP (e.g. http://192.168.x.x:5174)
    port: 5174,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  worker: {
    format: 'es'
  }
});
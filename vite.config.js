import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite publicar en la raíz de un dominio o en una subcarpeta (p. ej. GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 700,
  },
});

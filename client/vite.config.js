import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// client/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: { port: 3001, proxy: { '/api': 'http://localhost:5001' } },
});

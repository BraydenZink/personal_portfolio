import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In development, Vite serves the React app and forwards API calls to Express.
    proxy: { '/api': 'http://localhost:8080' },
  },
  test: {
    include: ['tests/api/**/*.test.js'],
    environment: 'node',
  },
});

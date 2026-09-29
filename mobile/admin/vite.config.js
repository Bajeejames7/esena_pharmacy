import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// `@shared` is mobile/shared: the API client, UI kit and theme both apps use.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@shared': fileURLToPath(new URL('../shared', import.meta.url)) },
    // Shared files import React; make sure they get this app's copy.
    dedupe: ['react', 'react-dom'],
  },
  server: { fs: { allow: ['..'] } },
});

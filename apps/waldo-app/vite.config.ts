/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/waldo-app',
  base: process.env.VITE_BASE_PATH || '/',
  define: {
    __BASE_URL__: JSON.stringify(process.env.VITE_BASE_PATH || '/'),
  },
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    react(),
    viteImagemin({
      // Use jpegtran for lossless JPEG compression
      // This only optimizes the JPEG structure without re-encoding
      jpegtran: {
        progressive: true, // Progressive JPEGs can be smaller
      },
      // Disable mozjpeg to avoid lossy compression
      mozjpeg: false,
      // Lossless PNG optimization
      optipng: {
        optimizationLevel: 7,
      },
      // SVG optimization
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
        ],
      },
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));

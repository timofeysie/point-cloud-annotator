import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to serve pointcloud files as static assets without transformation
    {
      name: 'potree-static-assets',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Serve pointcloud files with correct content types and ensure they're not transformed
          if (req.url?.includes('/pointclouds/')) {
            if (req.url?.endsWith('cloud.js')) {
              // cloud.js contains pure JSON (same format as CDN), serve as JSON
              res.setHeader('Content-Type', 'application/json');
            } else if (req.url?.endsWith('cloud.json')) {
              res.setHeader('Content-Type', 'application/json');
            } else if (req.url?.endsWith('.bin')) {
              res.setHeader('Content-Type', 'application/octet-stream');
            } else if (req.url?.endsWith('.hrc')) {
              res.setHeader('Content-Type', 'application/octet-stream');
            }
            // Ensure these files are served as-is without any transformation
            res.setHeader('Cache-Control', 'public, max-age=31536000');
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      // Force all Three.js imports to use the same instance
      'three': path.resolve(__dirname, 'node_modules/three'),
    },
  },
  optimizeDeps: {
    include: ['three', 'lucide-react'],
    esbuildOptions: {
      // Force esbuild to bundle lucide-react dependencies
      plugins: [],
    },
  },
  build: {
    commonjsOptions: {
      include: [/lucide-react/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // Let Vite handle chunking automatically
      },
    },
  },
  // Ensure pointcloud assets are served as static files without transformation
  publicDir: 'public',
  assetsInclude: ['**/*.json', '**/*.bin', '**/*.hrc'],
  server: {
    fs: {
      // Allow serving files from the project root
      allow: ['..'],
    },
  },
  // Serve potree build files and resources
  publicDir: 'public',
  // Configure static file serving for potree
  assetsInclude: ['**/*.json', '**/*.bin', '**/*.hrc'],
});

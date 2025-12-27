// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  build: {
    target: 'esnext',
    lib: {
      entry: 'src/entry.tsx',   // <-- your MF entry
      formats: ['es'],
      fileName: () => 'react-mf.js',
    },
    rollupOptions: {
      // Externalize React/React-DOM - host app will provide via import maps
      // Everything else (MUI, react-router-dom, firebase, etc.) will be bundled
      external: ['react', 'react-dom'],
    },
    outDir: 'dist',
  },
});

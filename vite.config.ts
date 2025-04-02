import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { dependencies } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
    modulePreload: false,
    minify: false,
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'esm',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  plugins: [react(),federation({
    filename: 'remoteEntry.js',
    name: 'remote',
    exposes: {
      './remote-app': './src/App.tsx',
    },
    remotes: {},
    shared: {
      react: {
        requiredVersion: dependencies.react,
        singleton: true
      },
      'react-dom': {
        requiredVersion: dependencies['react-dom'],
        singleton: true
      },
      'react-router-dom': {
        requiredVersion: dependencies['react-router-dom'],
        singleton: true
      }
    },
  })],
  server: {
    port: 3000,
    open: true
  }
})

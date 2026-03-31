import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  css: {
    devSourcemap: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/tim-js-sdk') || id.includes('node_modules/tim-upload-plugin')) {
            return 'tencent-im';
          }
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
            return 'vue-vendor';
          }
        }
      }
    }
  },
  esbuild: {
    keepNames: command === 'serve'
  },
  server: {
    host: '0.0.0.0',
    port: 5175
  },
  preview: {
    host: '0.0.0.0',
    port: 4175
  }
}));

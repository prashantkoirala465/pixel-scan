import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    // three.js is dynamically imported and lands in its own lazy chunk;
    // ~700kB minified is expected for a 3D library.
    chunkSizeWarningLimit: 800,
  },
})

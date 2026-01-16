import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/napoleon-1812/',  // 替换为你的仓库名
  plugins: [vue()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          leaflet: ['leaflet'],
          d3: ['d3']
        }
      }
    }
  }
})

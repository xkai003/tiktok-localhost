import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 关键的代理配置
    proxy: {
      // 这里的 '/api' 和你 fetch 请求的 URL 中的 '/api' 要对应
      '/api': {
        target: 'http://localhost:3001/data', // 目标是你的后端服务地址
        changeOrigin: true,               // 必须设置为 true
      }
    }
  }
})

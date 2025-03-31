import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/


export default defineConfig({
  plugins: [vue()],


  // 跨域配置：
  server: {
    host: "0.0.0.0",
    port: 3009,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3007/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }

}
)


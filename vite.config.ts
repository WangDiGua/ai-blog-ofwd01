import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY),
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '') // 根据后端实际路由决定是否保留 /api，通常建议保留或根据后端规范调整
          // 如果后端接口就是 /login, /articles，则使用 rewrite 去掉 /api
          // 如果后端接口是 /api/login，则不需要 rewrite
          // 这里假设后端接口不带 /api 前缀，所以去掉
        }
      }
    }
  }
})
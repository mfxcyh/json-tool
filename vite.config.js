import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 相对路径产物，便于直接丢到任意静态服务器 / 子目录
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 显式绑 IPv4：只监听 localhost 时部分环境会只绑定 ::1，导致 127.0.0.1 访问被拒
    host: '127.0.0.1',
    port: 5173,
    open: false,
  },
})

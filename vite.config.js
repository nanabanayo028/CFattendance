import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 告诉 Vite，这两个网页都要打包
        main: 'index.html',
        admin: 'admin.html'
      }
    }
  }
})
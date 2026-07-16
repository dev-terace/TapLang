import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),  
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true // Docker 컨테이너 외부에서 접속할 수 있도록 허용
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }

})
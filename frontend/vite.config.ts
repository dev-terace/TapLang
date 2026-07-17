import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

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
      // '@'를 입력하면 현재 프로젝트 루트의 'src' 폴더를 가리키도록 설정
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }

})
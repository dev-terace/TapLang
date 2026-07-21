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
    port: 5174,
    host: true, // Docker 컨테이너 외부에서 접속할 수 있도록 허용
    watch: { usePolling: true },
    hmr: {
      clientPort: 5174, // 브라우저가 접속하는 실제 포트
    },
    proxy: {
      // /api 로 시작하는 요청은 백엔드(3000 포트)로 우회 처리
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
      }
    }

  },

  resolve: {
    alias: {
      // '@'를 입력하면 현재 프로젝트 루트의 'src' 폴더를 가리키도록 설정
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }

})
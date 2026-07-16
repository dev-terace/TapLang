/** @type {import('tailwindcss').Config} */

export default {
  // 프로젝트 내에서 Tailwind 클래스를 사용할 파일 범위 지정
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 💡 바로 여기에 기존 inline 설정을 그대로 이식합니다!
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        pixel: ['"VT323"', 'monospace'],
        sans: ['"Galmuri9"', 'sans-serif']
      }
    }
  },
  plugins: [],
}
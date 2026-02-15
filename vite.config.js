// Vite 설정 파일
// Vite = 우리 앱을 실행하고 빌드해주는 도구
// 여기서 "React 쓸 거야", "Tailwind 쓸 거야"를 알려주는 거예요

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),        // React를 사용하겠다는 뜻
    tailwindcss(),  // Tailwind CSS를 사용하겠다는 뜻
  ],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 💡 FIX: Add your repository name here, including the leading and trailing slash
  base: '/chat_app/' 
})

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
// /AgriNET/
export default defineConfig({
  base: '/AgriNET/',
  plugins: [
    react(),
    legacy()
  ],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Игнорируем TypeScript ошибки при сборке
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        warn(warning)
      }
    }
  },
  esbuild: {
    // Отключаем строгую проверку TypeScript при сборке
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})

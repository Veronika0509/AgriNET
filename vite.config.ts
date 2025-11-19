import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    legacy(),
    basicSsl()
  ],
  server: {
    https: true,
  },
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

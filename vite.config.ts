import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const useHttps = !env.VITE_NO_SSL;

  return {
  base: './',
  plugins: [
    react(),
    legacy(),
    ...(useHttps ? [basicSsl()] : []),
  ],
  server: {
    ...(useHttps ? { https: true } : {}),
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
  };
})

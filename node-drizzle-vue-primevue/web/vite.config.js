import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default ({mode}) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  // https://vitejs.dev/config/
  return defineConfig({
    base: (process.env.VITE_APP_BASE_PATH || '/').endsWith('/') ? process.env.VITE_APP_BASE_PATH : process.env.VITE_APP_BASE_PATH + '/',
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      headers: {
        'Content-Security-Policy': 'upgrade-insecure-requests',
      }
    }
  })
}
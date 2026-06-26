import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

const removeProtectedDownloadsFromBuild = () => ({
  name: 'remove-protected-downloads-from-build',
  closeBundle() {
    rmSync(resolve('dist', 'download'), { recursive: true, force: true })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), removeProtectedDownloadsFromBuild()],
  define: {
    global: 'window'
  },
  build: {
    copyPublicDir: process.env.VITE_COPY_PUBLIC !== 'false'
  },
  server: {
    proxy: {
      '/auth': 'http://127.0.0.1:3001',
      '/groups': 'http://127.0.0.1:3001',
      '/series': 'http://127.0.0.1:3001',
      '/models': 'http://127.0.0.1:3001',
      '/portfolio': 'http://127.0.0.1:3001',
      '/downloads': 'http://127.0.0.1:3001',
      '/banners': 'http://127.0.0.1:3001',
      '/upload-download': 'http://127.0.0.1:3001',
      '/upload-portfolio': 'http://127.0.0.1:3001',
      '/upload-sample-and-register': 'http://127.0.0.1:3001',
      '/upload-banner': 'http://127.0.0.1:3001',
      '/maintenance': 'http://127.0.0.1:3001',
      '/samples': 'http://127.0.0.1:3001',
      '/download': 'http://127.0.0.1:3001'
    }
  }
})

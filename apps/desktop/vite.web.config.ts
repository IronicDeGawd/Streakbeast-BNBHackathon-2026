import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Strip Electron's restrictive CSP meta tag for browser dev mode
function stripCSP(): Plugin {
  return {
    name: 'strip-csp',
    transformIndexHtml(html) {
      return html.replace(
        /<meta http-equiv="Content-Security-Policy"[^>]*>/,
        ''
      )
    }
  }
}

export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@contracts': resolve(__dirname, 'src/renderer/src/contracts')
    }
  },
  plugins: [stripCSP(), react()],
  server: {
    port: 5173,
    open: true
  }
})

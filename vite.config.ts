import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sui-rpc': {
        target: 'https://fullnode.mainnet.sui.io:443',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sui-rpc/, ''),
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => { console.log('sui proxy error', err) })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sui RPC →', req.method, req.url)
            proxyReq.setTimeout(30000, () => { proxyReq.destroy() })
          })
        },
      },
      '/solana-rpc': {
        target: 'https://api.mainnet-beta.solana.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/solana-rpc/, ''),
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => { console.log('solana proxy error', err) })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Strip Origin/Referer — the Solana Foundation RPC blocks browser-originated requests
            proxyReq.removeHeader('origin')
            proxyReq.removeHeader('referer')
            proxyReq.setTimeout(30000, () => { proxyReq.destroy() })
          })
        },
      }
    }
  }
})


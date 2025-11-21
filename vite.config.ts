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
        timeout: 30000, // 30 second timeout
        proxyTimeout: 30000, // 30 second proxy timeout
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Set timeout on the request itself
            proxyReq.setTimeout(30000, () => {
              console.log('Request timeout');
              proxyReq.destroy();
            });
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})


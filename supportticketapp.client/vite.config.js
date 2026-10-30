import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'https://localhost:7029', // replace with your API's HTTPS port
                secure: false,
                changeOrigin: true
            },
            '/swagger': {
                target: 'https://localhost:7029',
                secure: false,
                changeOrigin: true
            }
        }
    }
})
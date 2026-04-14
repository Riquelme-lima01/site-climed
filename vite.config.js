import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                ultrassom: resolve(__dirname, 'ultrassom.html')
                // Se tiver mais páginas no futuro, é só adicionar aqui!
            }
        }
    }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necessário para conexões de rede
    port: 5173, // Porta padrão do Vite
    strictPort: true, // Não tentar outras portas se 5173 estiver em uso
    hmr: {
      clientPort: 5173 // Força o cliente a usar a porta 5173 para HMR
    }
  }
})

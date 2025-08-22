import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Isso configura o esbuild para suportar módulos ES6
    jsxFactory: 'React.createElement',
    jsxFragment: 'Fragment',
  },
  resolve: {
    alias: {
      '@': '/src',  // Se tiver um alias para o caminho absoluto, como src/
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  server: {
    open: true,
    fs: {
      allow:['.'],
    },
  },
})

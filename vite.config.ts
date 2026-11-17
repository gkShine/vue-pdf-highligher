import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // demo 所需的 pdf 静态资源目录
  publicDir: 'example',
  worker: {
    format: 'es'
  },
  ...(command === 'build'
    ? {
        // 库构建不需要 demo 静态资源
        publicDir: false,
        build: {
          lib: {
            entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
            name: 'GOKUAI',
            formats: ['es', 'umd'] as const,
            cssFileName: 'style',
            fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.js')
          },
          rollupOptions: {
            external: ['vue'],
            output: {
              exports: 'named',
              globals: {
                vue: 'Vue'
              }
            }
          }
        }
      }
    : {
        server: {
          port: 8082,
          host: true
        }
      })
}))

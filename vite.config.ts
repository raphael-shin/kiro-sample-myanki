import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 개발 서버 설정
  server: {
    port: 3000,
    open: true,
    host: true,
    // HMR 설정
    hmr: {
      overlay: true
    }
  },
  
  // 빌드 설정
  build: {
    // 빌드 최적화 옵션
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        // 청크 분할 최적화
        manualChunks: {
          vendor: ['react', 'react-dom'],
          zustand: ['zustand'],
          dexie: ['dexie']
        }
      }
    },
    // 청크 크기 경고 임계값 설정
    chunkSizeWarningLimit: 1000
  },
  
  // 절대 경로 임포트 설정
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@store': resolve(__dirname, './src/store'),
      '@db': resolve(__dirname, './src/db'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@styles': resolve(__dirname, './src/styles'),
      '@features': resolve(__dirname, './src/features')
    }
  },
  
  // 환경 변수 설정
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  
  // CSS 설정
  css: {
    devSourcemap: true,
    postcss: './postcss.config.js'
  },
  
  // 최적화 설정
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'dexie']
  }
})
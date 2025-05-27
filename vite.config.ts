import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 从环境变量获取构建输出目录，默认为 'dist'
const buildOutDir = process.env.BUILD_OUT_DIR || 'dist';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: buildOutDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
}); 
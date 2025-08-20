import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './setupTests.js',
    globals: true,
    coverage: {
      reporter: ['text', 'lcov']
    }
  }
});

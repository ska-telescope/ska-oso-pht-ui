import path from 'path';
import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/*.test.tsx'],
    setupFiles: ['src/setupTests.ts'],

    includeTaskLocation: true,
    server: {
      deps: {
        inline: ['@mui/material']
      }
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['cobertura', 'text', 'json', 'html'],
      reportsDirectory: 'build/coverage',
      include: ['src/{components,pages,utils,services}/**/**/*.tsx'],
      exclude: [
        '**/node_modules/**',
        'src/components/app/App.tsx',
        'src/services/theme/theme.tsx',
        'src/services/api/getSubArrayData/getSubArrayData.tsx',
        'src/utils/storage',
        'src/utils/testing',
        'src/utils/types'
      ]
    },
    exclude: [...configDefaults.exclude, 'shared/*']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
});

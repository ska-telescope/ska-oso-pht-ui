import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';
import path from 'path';

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
      provider: 'istanbul',
      reporter: ['cobertura', 'text', 'json', 'html'],
      reportsDirectory: 'build/coverage',
      include: ['src/{components,pages,utils,services}/**/*.{ts,tsx}'],
      exclude: [
        'src/components/app/App.tsx',
        'src/services/theme/theme.tsx',
        'src/services/api/*/*.testData.ts',
        'src/services/api/getContinuumData/mockedContinuumResults.ts',
        'src/services/api/getPSSData/mockedPSSResults.ts',
        'src/services/api/getSubArrayData/getSubArrayData.tsx',
        'src/services/api/getZoomData/mockedZoomResults.ts'
      ]
    },
    exclude: [...configDefaults.exclude, 'shared/*']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages')
    }
  }
});

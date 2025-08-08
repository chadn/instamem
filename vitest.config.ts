import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './tests/unit/coverage',
      exclude: [
        'tests/**/*',
        'node_modules/**/*',
        '**/*.config.*',
        '**/*.d.ts',
        'scripts/**/*',
        'public/**/*',
        '.next/**/*'
      ],
      thresholds: {
        global: {
          statements: 60,
          branches: 50,
          functions: 60,
          lines: 60
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
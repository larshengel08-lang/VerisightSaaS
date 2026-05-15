import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: [
      'lib/**/*.test.ts',
      'lib/**/*.test.tsx',
      'app/**/*.test.ts',
      'app/**/*.test.tsx',
      'components/**/*.test.ts',
      'components/**/*.test.tsx',
      'scripts/import-content-machine-post.test.mjs',
    ],
  },
})

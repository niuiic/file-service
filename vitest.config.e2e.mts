import { join } from 'path'
import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

const rootDir = process.cwd()

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.e2e.test.ts'],
    alias: {
      '@': join(rootDir, 'src')
    },
    root: rootDir
  },
  resolve: {
    alias: {
      '@': join(rootDir, 'src')
    }
  },
  plugins: [swc.vite()]
})

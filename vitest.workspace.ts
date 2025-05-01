import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./vite.config.base.ts",
  "./tests/vitest.config.ts",
  "./client/vite.config.ts",
  "./server/vite.config.ts"
])

import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./client/vite.config.ts",
  "./server/vite.config.ts",
  "./shared/vitest.config.ts"
])

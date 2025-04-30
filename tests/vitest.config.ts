import { defineConfig } from "vitest/config";
import Vue from "@vitejs/plugin-vue";
import baseConfig from "../vite.config.base";

export default defineConfig({
  ...baseConfig,
  plugins: [Vue()],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    setupFiles: ["./tests/setup.ts"],
  },
});

import { defineConfig } from "vite";
import baseConfig from "../vite.config.base";

export default defineConfig({
  ...baseConfig,
  build: {
    outDir: "../dist/server",
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["node:module"],
    },
  },
});

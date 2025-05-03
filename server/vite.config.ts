import { defineConfig } from "vite";
import baseConfig from "../vite.config.base";
import { fileURLToPath } from "node:url";

export default defineConfig({
  ...baseConfig,
  // build: {
  //   outDir: "../dist/server",
  //   lib: {
  //     entry: "src/index.ts",
  //     formats: ["es"],
  //     fileName: "index",
  //   },
  //   rollupOptions: {
  //     external: ["node:module"],
  //   },
  // },
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
});

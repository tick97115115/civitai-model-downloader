import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import baseConfig from "../vite.config.base";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  ...baseConfig,
  plugins: [vue(), vueDevTools()],
  root: fileURLToPath(new URL(".", import.meta.url)),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@server": fileURLToPath(new URL("../server", import.meta.url)),
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://civitai.com",
        changeOrigin: true,
      },
      "/trpc": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
      // "/orpc": {
      //   target: "http://127.0.0.1:8787",
      //   changeOrigin: true,
      // },
      "/login": {
        target: "https://civitai.com",
        changeOrigin: true,
      },
      "/media": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
});

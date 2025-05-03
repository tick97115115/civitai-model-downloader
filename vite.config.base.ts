import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  // 共享配置
  resolve: {
    alias: {
      "@/*": fileURLToPath(new URL("./client/src", import.meta.url)),
      "@server/*": fileURLToPath(new URL("./server", import.meta.url)),
      "@shared/*": fileURLToPath(new URL("./shared", import.meta.url)),
    },
  },
});

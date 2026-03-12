import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

declare const process: {
  env: Record<string, string | undefined>;
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    proxy: {
      "/api/cae": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cae/, "")
      },
      "/api/chronik": {
        target: process.env.VITE_CHRONIK_URL || "http://127.0.0.1:8331",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chronik/, "")
      }
    }
  }
});

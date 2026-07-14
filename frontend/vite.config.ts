import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      // OAuth callback must hit the same origin that set the state cookie.
      "/auth": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});

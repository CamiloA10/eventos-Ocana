import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "/quehaypahacer/",
  server: {
    host: "localhost",
    port: 4173,
    strictPort: false,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "localhost",
    port: 4173,
    strictPort: false,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

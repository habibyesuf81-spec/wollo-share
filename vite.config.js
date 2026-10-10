import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.VITE_BASE_PATH || "/",
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          ...(env.VITE_DATA_MODE === "supabase" && {
            manualChunks(id) {
              if (id.includes("@supabase/")) return "supabase";
            }
          })
        }
      }
    },
    server: {
      proxy: {
        "/api": "http://127.0.0.1:3001"
      }
    }
  };
});

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue(),
      tailwindcss(),
    ],

    server: {
      port: Number(env.VITE_PORT),
      host: true,
      watch: {
        usePolling: true,
      },
      hmr: {
        clientPort: Number(env.VITE_HMR_CLIENT_PORT),
      },
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
        },
      },
    },

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
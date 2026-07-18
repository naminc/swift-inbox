import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (mode === "production" && !env.VITE_API_URL) {
    throw new Error("VITE_API_URL must be set for production builds");
  }

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [viteReact(), tailwindcss()],
  };
});

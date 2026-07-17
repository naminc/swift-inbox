import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "production" && !process.env.VITE_API_URL) {
    throw new Error("VITE_API_URL must be set for production builds");
  }

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [viteReact(), tailwindcss()],
  };
});

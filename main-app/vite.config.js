import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// Tailwind Vite
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
});

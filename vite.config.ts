import { URL, fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const commitDate = execSync("git log -1 --format=%cI").toString().trimEnd();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  define: {
    "import.meta.env.VITE_GIT_COMMIT_DATE": JSON.stringify(commitDate)
  }
});

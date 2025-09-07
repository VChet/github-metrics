import { execSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import Vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import type { TreeNode } from "unplugin-vue-router";
import PWA_OPTIONS from "./src/constants/pwa-options.ts";

const commitDate = execSync("git log -1 --format=%cI").toString().trimEnd();

function getRouteName(node: TreeNode): string {
  if (!node.parent) return "";
  const parentName = getRouteName(node.parent);
  let name = node.value.rawSegment;
  name = name[0].toUpperCase() + name.slice(1);
  if (!parentName) return name;
  return parentName;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({ dts: "./src/types/typed-router.ts", getRouteName }),
    Vue(),
    VitePWA(PWA_OPTIONS)
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  define: {
    "import.meta.env.VITE_GIT_COMMIT_DATE": JSON.stringify(commitDate)
  },
  server: {
    port: 7400
  }
});

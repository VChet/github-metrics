import { execSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import Vue from "@vitejs/plugin-vue";
import namedPort from "named-port";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import VueRouter from "vue-router/vite";
import type { TreeNode } from "vue-router/unplugin";
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
    VueRouter({ dts: "./src/types/lib/typed-router.ts", getRouteName }),
    Vue(),
    VitePWA(PWA_OPTIONS)
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    rolldownOptions: {
      onLog(level, log, defaultHandler) {
        // TODO: Remove when updating VueUse beyond v14.3.0
        if (log.code === "INVALID_ANNOTATION") return;
        defaultHandler(level, log);
      }
    }
  },
  define: {
    "import.meta.env.VITE_GIT_COMMIT_DATE": JSON.stringify(commitDate)
  },
  server: {
    port: namedPort(process.env.npm_package_name!, { min: 7000, max: 10000 })
  }
});

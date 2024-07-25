import type { ManifestOptions, VitePWAOptions } from "vite-plugin-pwa";

const manifest: Partial<ManifestOptions> = {
  name: "GitHub Metrics",
  short_name: "GitHub Metrics",
  id: "github-metrics",
  description: "Discover comprehensive insights into your GitHub repositories' metrics. Track stars, forks, and more, all conveniently stored locally",
  dir: "ltr",
  orientation: "portrait",
  theme_color: "#0d1117",
  background_color: "#0d1117",
  icons: [
    { src: "icon-192x192.png", sizes: "192x192", type: "image/png" },
    { src: "icon-512x512.png", sizes: "512x512", type: "image/png" },
    { src: "icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" }
  ]
};

const pwaOptions: Partial<VitePWAOptions> = {
  base: "/",
  strategies: "injectManifest",
  srcDir: "src",
  filename: "sw.ts",
  includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
  manifest,
  workbox: { sourcemap: true }
};

export default pwaOptions;

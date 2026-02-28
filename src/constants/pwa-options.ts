import type { ManifestOptions, VitePWAOptions } from "vite-plugin-pwa";

const manifest: Partial<ManifestOptions> = {
  name: "GitHub Metrics",
  short_name: "GH Metrics",
  id: "github-metrics",
  description: "Discover comprehensive insights into your GitHub repositories' metrics. Track stars, forks, and more, all conveniently stored locally",
  dir: "ltr",
  orientation: "portrait",
  theme_color: "#19191a",
  background_color: "#19191a",
  icons: [
    { src: "icon-192x192.png", sizes: "192x192", type: "image/png" },
    { src: "icon-512x512.png", sizes: "512x512", type: "image/png" },
    { src: "icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" }
  ]
};

const pwaOptions: Partial<VitePWAOptions> = {
  base: "/",
  strategies: "generateSW",
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
  manifest,
  workbox: {
    sourcemap: true,
    cleanupOutdatedCaches: true,
    navigateFallback: "/index.html",
    runtimeCaching: [
      {
        urlPattern: /\.(?:png|jpe?g|svg|webp|woff2)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "asset-cache",
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      }
    ]
  }
};

export default pwaOptions;

function getHsla(hue: number, opacity: number | string = 1): string {
  return `hsla(${hue}, 40%, 70%, ${opacity})`;
}

const predefinedColorMap: Readonly<Record<string, string>> = {
  "@octokit": "#ffffff",
  "@types/": "#0086e0",
  "esbuild": "#ffcf00",
  "eslint": "#b7b7ff",
  "neostandard": "#b7b7ff",
  "postcss": "#f44d27",
  "sass": "#cc6699",
  "scss": "#cc6699",
  "stylelint": "#d0d5dd",
  "svelte": "#ff3e00",
  "tsconfig": "#0086e0",
  "tslib": "#0086e0",
  "tsx": "#0086e0",
  "type-fest": "#0086e0",
  "typescript": "#0086e0",
  "vite": "#9499ff",
  "vue": "#41b883",
  "workbox": "#ee810f"
};

export function composeHashColorFromString(name: string): string {
  const mapKey = Object.keys(predefinedColorMap).find((key) => name.includes(key));
  if (mapKey) return predefinedColorMap[mapKey];

  let hash = 0;
  for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
  return getHsla(hash % 360);
}

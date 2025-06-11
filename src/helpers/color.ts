function getHsla(hue: number, opacity: number | string = 1): string {
  return `hsla(${hue}, 40%, 70%, ${opacity})`;
}

const predefinedColorMap: Readonly<Record<string, string>> = {
  "@types/": "#0086e0",
  "esbuild": "#ffcf00",
  "eslint": "#b7b7ff",
  "postcss": "#f44d27",
  "stylelint": "#d0d5dd",
  "svelte": "#ff3e00",
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

function getHsla(hue: number, opacity: number | string = 1): string {
  return `hsla(${hue}, 50%, 60%, ${opacity})`;
}

const predefinedColorMap = {
  "@types/": "#007acc",
  "eslint": "#b7b7ff",
  "postcss": "#dd3a0a",
  "stylelint": "#d0d5dd",
  "svelte": "#ff3e00",
  "typescript": "#007acc",
  "vite": "#9499ff",
  "vue": "#41b883",
  "workbox": "#ee810f"
} as Record<string, string>;

export function composeHashColorFromString(name: string): string {
  let hash = 0;
  const mapKey = Object.keys(predefinedColorMap).find((key) => name.includes(key));
  if (mapKey) return predefinedColorMap[mapKey];
  for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
  return getHsla(hash % 360);
}

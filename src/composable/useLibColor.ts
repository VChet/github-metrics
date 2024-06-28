function getHsla(hue: number, opacity: number | string = 1) {
  return `hsla(${hue}, 50%, 60%, ${opacity})`;
}

const predefinedColorMap = {
  "eslint": "#b7b7ff",
  "stylelint": "#d0d5dd",
  "svelte": "#ff3e00",
  "@types/": "#007acc",
  "typescript": "#007acc",
  "postcss": "#dd3a0a",
  "vite": "#9499ff",
  "vue": "#41b883"
} as Record<string, string>;

export function composeHashColorFromString(name: string) {
  let hash = 0;
  const mapKey = Object.keys(predefinedColorMap).find((key) => name.includes(key));
  if (mapKey) return predefinedColorMap[mapKey];
  for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
  return getHsla(hash % 360);
}

function getHsla(hue: number, opacity: number | string = 1): string {
  return `hsla(${hue}, 40%, 70%, ${opacity})`;
}

const predefinedColorMap: Readonly<Record<string, string>> = {
  "@octokit": "#ffffff",
  "@stylistic": "#f43f5e",
  "@types": "#0086e0",
  "cspell": "#e67a64",
  "es-toolkit": "#3dd68c",
  "esbuild": "#ffcf00",
  "eslint": "#b7b7ff",
  "neostandard": "#b7b7ff",
  "postcss": "#f44d27",
  "sass": "#cc6699",
  "scss": "#cc6699",
  "storybook": "#ff4785",
  "stylelint": "#d0d5dd",
  "svelte": "#ff3e00",
  "ts": "#0086e0",
  "type": "#0086e0",
  "vite": "#9499ff",
  "vue": "#41b883",
  "workbox": "#ee810f"
};

function normalizeName(name: string): string {
  if (name.startsWith("@")) return name.split("/")[0];
  return name;
}

export function composeHashColor(name: string): string {
  name = normalizeName(name);
  const mapKey = Object.keys(predefinedColorMap).find((key) => name.includes(key));
  if (mapKey) return predefinedColorMap[mapKey];

  let hash = 0;
  for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
  return getHsla(hash % 360);
}

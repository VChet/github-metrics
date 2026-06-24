import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import stylelint from "stylelint";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://github.com/ozh/github-colors
const SOURCE_URL = "https://raw.githubusercontent.com/ozh/github-colors/refs/heads/master/colors.json";
const OUTPUT_PATH = join(__dirname, "..", "assets", "language-colors.scss");

async function fetchCSS() {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`Failed to fetch colors.json: ${response.status}`);

  const json = await response.json() as Record<string, { color: string, url: string }>;
  return json;
}
function normalizeColors(json: object) {
  return Object.entries(json).flatMap(([language, data]) => {
    if (!data?.color) return [];
    const name = normalizeLanguageName(language);
    const color = data.color.toLocaleLowerCase();
    return [`.language-${name} { background-color: ${color}; }`];
  });
}
function normalizeLanguageName(name: string): string {
  return name
    .replace(/[()']/g, "")
    .replace(/\+/g, "p")
    .replace(/#/g, "sharp")
    .replace(/\*/g, "star")
    .replace(/\./g, "dot")
    .replace(/ /g, "-")
    .toLowerCase()
    .trim();
}

async function main() {
  const colorsObj = await fetchCSS();
  const cssArray = normalizeColors(colorsObj);
  const css = cssArray.join("\n");

  const { code } = await stylelint.lint({ code: css, fix: true });
  if (!code) throw new Error("Failed to lint CSS");

  await writeFile(OUTPUT_PATH, code, "utf8");
  console.info(`Generated ${cssArray.length} CSS classes`);
}

function exit(error: unknown) {
  if (error) console.error(error instanceof Error ? error.message : String(error));
  process.exit(error ? 1 : 0);
}
main().then(exit).catch(exit);

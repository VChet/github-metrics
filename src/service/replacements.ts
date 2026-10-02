import type { ManifestModule, ModuleReplacementMapping } from "module-replacements";

const URL = "https://unpkg.com/module-replacements@latest";
const MANIFESTS = [
  `${URL}/manifests/native.json`,
  `${URL}/manifests/micro-utilities.json`,
  `${URL}/manifests/preferred.json`
];

async function request<T>(url: string, options = {}): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function fetchModuleReplacements(): Promise<Record<string, ModuleReplacementMapping>> {
  const responses = await Promise.all(MANIFESTS.map((url) => request<ManifestModule>(url)));
  return responses.reduce((mappings, response) => ({ ...mappings, ...response.mappings }), {});
}

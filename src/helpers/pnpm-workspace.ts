import { parseYAML } from "confbox/yaml";

export interface PnpmWorkspace {
  [key: string]: unknown
  catalog?: Record<string, string>
  catalogs?: Record<string, Record<string, string>>
}

export function parsePnpmWorkspace(payload: string): PnpmWorkspace {
  return parseYAML(payload);
}

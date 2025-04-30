import { isObject } from "@vueuse/core";
import type { Repository } from "@/composable/useRepo";
import type { SettingsStore } from "@/store/settings";

export interface ExportedData {
  settings: SettingsStore
  excludedDependencies: string[]
  repositories: ExportedRepository[]
}

export function isExportedData(data: unknown): data is ExportedData {
  return isObject(data) && "settings" in data && "excludedDependencies" in data && "repositories" in data;
}

export type ExportedRepository = Pick<Repository, "id" | "full_name" | "integrations">;
export function isExportedRepository(data: unknown): data is ExportedRepository {
  return isObject(data) && "id" in data && "full_name" in data && "integrations" in data;
}

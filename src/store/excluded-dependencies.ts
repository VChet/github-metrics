import { createGlobalState, useLocalStorage } from "@vueuse/core";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";

type ExcludedDependenciesStore = Set<string>;
const DEFAULT_STORE: ExcludedDependenciesStore = new Set();

export const useExcludedDependenciesStore = createGlobalState(() => {
  const local = useLocalStorage("excludedDependencies", DEFAULT_STORE);
  const { data: excludedDependencies } = useIDBKeyval("excludedDependencies", local.value ?? DEFAULT_STORE, { deep: true, writeDefaults: true });

  function hideDependency(dep: string): void {
    excludedDependencies.value.add(dep);
  }
  function showDependency(dep: string): void {
    excludedDependencies.value.delete(dep);
  }

  function importExcludedDependencies(deps: string[]): void {
    excludedDependencies.value = new Set(deps);
  }

  return {
    excludedDependencies,
    importExcludedDependencies,
    hideDependency,
    showDependency
  };
});

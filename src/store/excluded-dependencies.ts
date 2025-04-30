import { createSharedComposable, useLocalStorage } from "@vueuse/core";

type ExcludedDependenciesStore = Set<string>;
const DEFAULT_STORE: ExcludedDependenciesStore = new Set();

export const useExcludedDependenciesStore = createSharedComposable(() => {
  const excludedDependencies = useLocalStorage("excludedDependencies", DEFAULT_STORE, { mergeDefaults: true });

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

import { useLocalStorage } from "@vueuse/core";

type ExcludedDependenciesStore = Set<string>;
const DEFAULT_STORE: ExcludedDependenciesStore = new Set();

export function useExcludedDependenciesStore() {
  const excludedDependencies = useLocalStorage("excludedDependencies", DEFAULT_STORE, { mergeDefaults: true });

  function hideDependency(dep: string): void {
    excludedDependencies.value.add(dep);
  }
  function showDependency(dep: string): void {
    excludedDependencies.value.delete(dep);
  }

  return {
    excludedDependencies,
    hideDependency,
    showDependency
  };
}
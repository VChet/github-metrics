import { computed } from "vue";
import { all, type ModuleReplacementMapping } from "module-replacements";
import { useRepositoriesStore } from "@/store/repositories";
import type { Repository } from "./useRepo";

function isLocalDependency(version: string): boolean {
  return version.startsWith("link:") || version.startsWith("file:");
}
function isAliasDependency(version: string): boolean {
  return version.startsWith("npm:");
}

export function useDependencyTable() {
  const { repositories } = useRepositoriesStore();

  const repositoriesWithDependencies = computed<Repository[]>(() => repositories.value.filter((repo) => !!repo.dependencies));
  const hasDependencies = computed<boolean>(() => !!repositoriesWithDependencies.value.length);

  const dependencies = computed<string[]>(() => {
    if (!hasDependencies.value) return [];
    const set: Set<string> = new Set();
    for (const repo of repositoriesWithDependencies.value) {
      for (const key in repo.dependencies) {
        const version = repo.dependencies[key];
        if (version && !isLocalDependency(version) && !isAliasDependency(version)) { set.add(key); }
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  const replacements = computed<ModuleReplacementMapping[]>(() => {
    const map: Map<string, ModuleReplacementMapping> = new Map();
    for (const dependency of dependencies.value) {
      const mapping = all.mappings[dependency];
      if (mapping) map.set(dependency, mapping);
    }
    return [...map.values()];
  });

  return {
    hasDependencies,
    repos: repositoriesWithDependencies,
    dependencies,
    replacements
  };
}

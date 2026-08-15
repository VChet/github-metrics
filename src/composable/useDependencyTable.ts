import { computed } from "vue";
import { all, type ModuleReplacementMapping } from "module-replacements";
import { useRepositoriesStore } from "@/store/repositories";
import type { Repository } from "./useRepo";

export function useDependencyTable() {
  const { repositories } = useRepositoriesStore();

  const repositoriesWithDependencies = computed<Repository[]>(() => repositories.value.filter((repo) => !!repo.dependencies));

  const dependencies = computed<string[]>(() => {
    const set = new Set<string>();
    for (const repo of repositories.value) {
      if (!repo.dependencies) continue;
      for (const dependency in repo.dependencies) set.add(dependency);
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
    repos: repositoriesWithDependencies,
    dependencies,
    replacements
  };
}

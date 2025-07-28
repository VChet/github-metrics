import { computed } from "vue";
import { useRepositoriesStore } from "@/store/repositories";
import type { Repository } from "./useRepo";

function isLocalDependency(version: string): boolean {
  return version.startsWith("link:") || version.startsWith("file:");
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
        if (version && !isLocalDependency(version)) { set.add(key); }
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  return {
    hasDependencies,
    repos: repositoriesWithDependencies,
    dependencies
  };
}

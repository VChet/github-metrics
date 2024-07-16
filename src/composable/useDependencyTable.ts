import { computed } from "vue";
import type { Repository } from "./useRepo";
import { useRepositoriesStore } from "@/store/repositories";

export function useDependencyTable() {
  const { storage } = useRepositoriesStore();
  const repositories = computed<Repository[]>(() => storage.value.repositories);

  const repositoriesWithDependencies = computed<Repository[]>(() => repositories.value.filter((repo) => !!repo.dependencies));
  const hasDependencies = computed<boolean>(() => !!repositoriesWithDependencies.value.length);

  const dependencies = computed<string[]>(() => {
    if (!hasDependencies.value) return [];
    const set: Set<string> = new Set();
    for (const { dependencies } of repositoriesWithDependencies.value) {
      for (const key in dependencies) { set.add(key); }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  return {
    hasDependencies,
    repos: repositoriesWithDependencies,
    dependencies
  };
}

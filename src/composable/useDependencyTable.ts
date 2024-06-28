import { computed } from "vue";
import type { Repository } from "./useRepo";

export function useDependencyTable(repositories: Repository[]) {
  const hasDependencies = computed<boolean>(() => {
    return repositories.some(({ dependencies }) => dependencies && Object.keys(dependencies).length);
  });

  const repos = computed(() => {
    return repositories.reduce((acc: (Partial<Repository>)[], { id, name, full_name, dependencies }) => {
      if (!dependencies) return acc;
      return [...acc, { id, dependencies, name, full_name }];
    }, []);
  });

  const dependencies = computed<string[]>(() => {
    if (!hasDependencies.value) return [];
    const set: Set<string> = new Set();
    for (const { dependencies } of repositories) {
      dependencies && Object.keys(dependencies).forEach((key) => set.add(key));
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  return {
    hasDependencies,
    repos,
    dependencies
  };
}

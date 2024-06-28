import { computed } from "vue";
import type { Repository } from "./useRepo";
import { useSettingsStore } from "@/store/settings";

export function useDependencyTable(repositories: Repository[]) {
  const hasDependencies = computed<boolean>(() => {
    return repositories.some(({ dependencies }) => dependencies && Object.keys(dependencies).length);
  });

  const { settings } = useSettingsStore();
  const repos = computed(() => {
    return repositories.reduce((acc: (Pick<Repository, "id" | "dependencies" | "name">)[], { id, full_name, name, dependencies }) => {
      if (!dependencies) return acc;
      return [...acc, { id, dependencies, name: settings.value.showOwner ? full_name : name }];
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

import { useArrayReduce, useStorage } from "@vueuse/core";
import dayjs from "dayjs";
import { watch } from "vue";
import { useRepositoriesStore } from "@/store/repositories";
import { deepCopy, deepEqual } from "@/helpers/object";

interface Summary {
  repos: number
  stars: number
  forks: number
  issues: number
}
interface SummaryStore {
  previous: Summary
  current: Summary
  lastUpdate: string
}
const DEFAULT_SUMMARY: Summary = { repos: 0, stars: 0, forks: 0, issues: 0 };
const DEFAULT_STORE: SummaryStore = {
  previous: deepCopy(DEFAULT_SUMMARY),
  current: deepCopy(DEFAULT_SUMMARY),
  lastUpdate: dayjs().toISOString()
};

export function useSummaryStorage() {
  const summary = useStorage<SummaryStore>(
    "summary",
    DEFAULT_STORE,
    localStorage,
    { mergeDefaults: true }
  );

  const { storage } = useRepositoriesStore();
  const currentSummary = useArrayReduce(
    () => storage.value.repositories,
    (acc, repo) => ({
      repos: storage.value.repositories.length,
      stars: acc.stars + repo.stargazers_count,
      forks: acc.forks + repo.forks_count,
      issues: acc.issues + repo.open_issues_count
    }),
    { repos: 0, stars: 0, forks: 0, issues: 0 }
  );
  watch(currentSummary, (current, previous) => {
    if (!previous || current.repos !== previous.repos) {
      summary.value.previous = deepCopy(current);
      summary.value.current = deepCopy(current);
      summary.value.lastUpdate = dayjs().toISOString();
    } else if (!deepEqual(current, previous)) {
      summary.value.previous = deepCopy(previous);
      summary.value.current = deepCopy(current);
      summary.value.lastUpdate = dayjs().toISOString();
    }
  }, { deep: true, immediate: true });

  return {
    summary
  };
}

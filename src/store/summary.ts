import { computed, watch } from "vue";
import { useArrayReduce, useStorage } from "@vueuse/core";
import dayjs from "dayjs";
import { useRepositoriesStore } from "./repositories";
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

  const diff = computed(() => ({
    stars: summary.value.current.stars - summary.value.previous.stars,
    forks: summary.value.current.forks - summary.value.previous.forks,
    issues: summary.value.current.issues - summary.value.previous.issues
  }));

  function updateSummary(current: Summary, previous?: Summary) {
    if (!previous || current.repos !== previous.repos) {
      summary.value.previous = deepCopy(current);
      summary.value.current = deepCopy(current);
      summary.value.lastUpdate = dayjs().toISOString();
    } else if (!deepEqual(current, previous)) {
      summary.value.previous = deepCopy(previous);
      summary.value.current = deepCopy(current);
      summary.value.lastUpdate = dayjs().toISOString();
    }
  }

  const { storage } = useRepositoriesStore();
  const latestSummary = useArrayReduce(
    () => storage.value.repositories,
    (acc, repo) => ({
      repos: storage.value.repositories.length,
      stars: acc.stars + repo.stargazers_count,
      forks: acc.forks + repo.forks_count,
      issues: acc.issues + repo.open_issues_count
    }),
    { repos: 0, stars: 0, forks: 0, issues: 0 }
  );
  watch(latestSummary, updateSummary, { deep: true, immediate: true });

  return {
    diff,
    repoAmount: computed(() => summary.value.current.repos),
    summary: computed(() => summary.value.current)
  };
}

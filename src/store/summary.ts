import { computed } from "vue";
import { createGlobalState, useEventListener, useLocalStorage } from "@vueuse/core";
import { useRepositoriesStore } from "./repositories";
import type { Repository } from "@/composable/useRepo";

interface RepoSummary {
  id: Repository["id"]
  stars: Repository["stargazers_count"]
  forks: Repository["forks_count"]
  issues: Repository["open_issues_count"]
}

interface SummaryStore {
  repos: RepoSummary[]
}
const DEFAULT_STORE: SummaryStore = { repos: [] };

interface Delta {
  stars: number
  forks: number
  issues: number
}

function summarize(repos: RepoSummary[]): Delta & { repos: number } {
  return repos.reduce((acc, repo) => {
    acc.repos++;
    acc.stars += repo.stars;
    acc.forks += repo.forks;
    acc.issues += repo.issues;
    return acc;
  }, { repos: 0, stars: 0, forks: 0, issues: 0 });
}

export const useSummaryStorage = createGlobalState(() => {
  const storage = useLocalStorage<SummaryStore>("summary", DEFAULT_STORE, { mergeDefaults: true });
  const { repositories } = useRepositoriesStore();

  const currentRepos = computed<RepoSummary[]>(() =>
    repositories.value.map((repo) => ({
      id: repo.id,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      issues: repo.open_issues_count
    }))
  );

  const summary = computed(() => summarize(currentRepos.value));
  const prevSummary = computed(() => summarize(storage.value.repos));

  const summaryDelta = computed<Delta>(() => ({
    stars: summary.value.stars - prevSummary.value.stars,
    forks: summary.value.forks - prevSummary.value.forks,
    issues: summary.value.issues - prevSummary.value.issues
  }));

  const repoDeltas = computed<Record<number, Delta>>(() => {
    const map: Record<number, Delta> = {};
    for (const current of currentRepos.value) {
      const prev = storage.value.repos.find((repo) => repo.id === current.id);
      map[current.id] = {
        stars: current.stars - (prev?.stars ?? 0),
        forks: current.forks - (prev?.forks ?? 0),
        issues: current.issues - (prev?.issues ?? 0)
      };
    }
    return map;
  });

  useEventListener("beforeunload", () => { storage.value.repos = currentRepos.value; });

  return {
    summary,
    summaryDelta,
    repoDeltas
  };
});

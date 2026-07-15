import { computed } from "vue";
import { createGlobalState, useLocalStorage, whenever } from "@vueuse/core";
import dayjs from "dayjs";
import { isExportedRepository, type ExportedRepository } from "@/helpers/export";
import { populateRepositoryData } from "@/helpers/repo";
import { fetchRepo } from "@/service/octokit";
import type { Repository } from "@/composable/useRepo";

interface RepositoriesStore {
  lastUpdate: string
  data: Repository[]
};
const DEFAULT_STORE: RepositoriesStore = {
  lastUpdate: dayjs().toISOString(),
  data: []
};

export const useRepositoriesStore = createGlobalState(() => {
  const storage = useLocalStorage<RepositoriesStore>("repositories", DEFAULT_STORE, { mergeDefaults: true });
  const repositories = computed({
    get: () => storage.value.data,
    set: (data) => { storage.value.data = data; }
  });
  const lastUpdate = computed({
    get: () => storage.value.lastUpdate,
    set: (data) => { storage.value.lastUpdate = data; }
  });
  const isEmpty = computed(() => !repositories.value.length);

  function isRepoExists(id: Repository["id"]): boolean {
    return repositories.value.some(({ id: repoId }) => repoId === id);
  }

  async function addRepository(
    fullName: Repository["full_name"],
    integrations: Repository["integrations"] = {}
  ): Promise<void> {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");
    if (isRepoExists(repo.id)) return updateRepository(fullName, integrations);

    repositories.value.push(await populateRepositoryData({ ...repo, integrations }));
  }

  function deleteRepository(id: Repository["id"]): void {
    repositories.value = repositories.value.filter((repo) => repo.id !== id);
  }

  async function updateRepository(
    fullName: Repository["full_name"],
    integrations: Repository["integrations"]
  ): Promise<void> {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");

    const entryIndex = repositories.value.findIndex(({ id }) => id === repo.id);
    repositories.value[entryIndex] = await populateRepositoryData({ ...repo, integrations });
  }
  async function updateRepositories(): Promise<void> {
    const fetchPromises = repositories.value.map(
      ({ full_name, integrations }) => updateRepository(full_name, integrations)
    );
    await Promise.all(fetchPromises);
    lastUpdate.value = dayjs().toISOString();
  }

  async function importRepositories(payload: ExportedRepository[]): Promise<void> {
    const fetchPromises = payload.reduce<Promise<void>[]>((acc, repo) => {
      if (isExportedRepository(repo)) {
        const { id, full_name, integrations } = repo;
        const request = isRepoExists(id) ?
          updateRepository(full_name, integrations) :
          addRepository(full_name, integrations);
        acc.push(request);
      }
      return acc;
    }, []);
    await Promise.all(fetchPromises);
  }
  function exportRepositories(): ExportedRepository[] {
    return repositories.value.map(({ id, full_name, integrations }) => ({ id, full_name, integrations }));
  }

  function updateCheck() {
    const isUpdateNeeded = !lastUpdate.value || dayjs().diff(lastUpdate.value, "hours") >= 1;
    if (isUpdateNeeded) return updateRepositories();
  }
  whenever(() => storage.value.lastUpdate, updateCheck, { immediate: true });

  return {
    repositories,
    isEmpty,
    addRepository,
    deleteRepository,
    updateRepository,
    updateRepositories,
    importRepositories,
    exportRepositories
  };
});

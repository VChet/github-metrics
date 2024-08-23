import { useLocalStorage } from "@vueuse/core";
import dayjs from "dayjs";
import type { PackageJson } from "type-fest";
import { computed } from "vue";
import { fetchRepo, fetchRepositoryPackages, fetchRepositoryWorkflows } from "@/service/octokit";
import type { Repository } from "@/composable/useRepo";

interface RepositoriesStore {
  lastUpdate: string
  data: Repository[]
};

type ExportedRepository = Pick<Repository, "id" | "full_name" | "integrations">;

const DEFAULT_STORE: RepositoriesStore = {
  lastUpdate: dayjs().toISOString(),
  data: []
};

export function useRepositoriesStore() {
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

  function _isRepoExists(id: Repository["id"]): boolean {
    return repositories.value.some(({ id: repoId }) => repoId === id);
  }
  async function _parseDependencies(fullName: Repository["full_name"]): Promise<PackageJson.Dependency | null> {
    const dependencies = await fetchRepositoryPackages(fullName);
    return dependencies ?? null;
  }
  async function _parseWorkflows(fullName: Repository["full_name"]): Promise<Repository["integrations"]["workflowBadge"]> {
    const workflowsData = await fetchRepositoryWorkflows(fullName);
    const firstWorkflow = workflowsData?.workflows[0];
    return firstWorkflow?.state === "active" ? firstWorkflow.badge_url : undefined;
  }

  async function addRepository(fullName: Repository["full_name"], integrations: Repository["integrations"] = {}): Promise<void> {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");
    if (_isRepoExists(repo.id)) return updateRepository(fullName, integrations);

    const dependencies = repo.language ? await _parseDependencies(fullName) : null;
    const workflowBadge = repo.private ? await _parseWorkflows(fullName) : undefined;
    integrations.workflowBadge = workflowBadge;

    repositories.value.push({ ...repo, dependencies, integrations });
  }

  function deleteRepository(id: Repository["id"]): void {
    repositories.value = repositories.value.filter((repo) => repo.id !== id);
  }

  async function updateRepository(fullName: Repository["full_name"], integrations: Repository["integrations"]): Promise<void> {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");

    const dependencies = repo.language ? await _parseDependencies(fullName) : null;
    const workflowBadge = !repo.private ? await _parseWorkflows(fullName) : undefined;
    integrations.workflowBadge = workflowBadge;

    const entryIndex = repositories.value.findIndex(({ id }) => id === repo.id);
    repositories.value[entryIndex] = { ...repo, dependencies, integrations };
  }
  async function updateRepositories(): Promise<void> {
    const fetchPromises = repositories.value.map(
      ({ full_name, integrations }) => updateRepository(full_name, integrations)
    );
    await Promise.all(fetchPromises);
    lastUpdate.value = dayjs().toISOString();
  }

  function importRepositories(payload: Repository[]): void {
    for (const { id, full_name, integrations } of payload) {
      _isRepoExists(id) ? updateRepository(full_name, integrations) : addRepository(full_name, integrations);
    }
  }
  function exportRepositories(): string {
    const repos: ExportedRepository[] = repositories.value.map(
      ({ id, full_name, integrations }) => ({ id, full_name, integrations })
    );
    return JSON.stringify(repos, null, 2);
  }

  function updateCheck() {
    const isUpdateNeeded = !lastUpdate.value || dayjs().diff(dayjs(lastUpdate.value), "hours") >= 1;
    if (isUpdateNeeded) return updateRepositories();
  }

  return {
    repositories,
    isEmpty,
    addRepository,
    deleteRepository,
    updateRepository,
    updateRepositories,
    importRepositories,
    exportRepositories,
    updateCheck
  };
}

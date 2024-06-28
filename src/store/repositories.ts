import { useStorage } from "@vueuse/core";
import dayjs from "dayjs";
import { fetchRepo, fetchRepositoryPackages, fetchRepositoryWorkflows } from "@/service/octokit";
import type { Repository } from "@/composable/useRepo";

type RepositoriesStore = {
  lastUpdate: string
  repositories: Repository[]
};

type ExportedRepository = Pick<Repository, "id" | "full_name" | "integrations">;

const DEFAULT_STORE: RepositoriesStore = {
  lastUpdate: dayjs().toISOString(),
  repositories: []
};

export function useRepositoriesStore() {
  const storage = useStorage<RepositoriesStore>(
    "repositories",
    DEFAULT_STORE,
    localStorage,
    { mergeDefaults: true }
  );

  function _isRepoExists(id: Repository["id"]): boolean {
    return storage.value.repositories.some(({ id: repoId }) => repoId === id);
  }
  async function _parseDependencies(fullName: Repository["full_name"]): Promise<Record<string, string> | null> {
    const dependencies = await fetchRepositoryPackages(fullName);
    return dependencies ?? null;
  }
  async function _parseIntegrations(fullName: Repository["full_name"]): Promise<Repository["integrations"]> {
    let integrations: Repository["integrations"] = {};
    const workflowsData = await fetchRepositoryWorkflows(fullName);
    if (workflowsData?.workflows[0]) {
      const { state, badge_url: workflowBadge } = workflowsData.workflows[0];
      if (state === "active") integrations = { ...integrations, workflowBadge };
    }
    return integrations;
  }

  async function addRepository(fullName: Repository["full_name"], integrations: Repository["integrations"]) {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");
    if (_isRepoExists(repo.id)) return;

    const dependencies = repo.language ? await _parseDependencies(fullName) : null;
    const parsedIntegrations = repo.private ? await _parseIntegrations(fullName) : {};
    integrations = { ...integrations, ...parsedIntegrations };

    storage.value.repositories.push({ ...repo, dependencies, integrations });
  }

  function deleteRepository(id: Repository["id"]) {
    storage.value.repositories = storage.value.repositories.filter((repo) => repo.id !== id);
  }

  async function updateRepository(fullName: Repository["full_name"], integrations: Repository["integrations"]) {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");

    const dependencies = await _parseDependencies(fullName);
    const entryIndex = storage.value.repositories.findIndex(({ id }) => id === repo.id);
    const initialIntegrations = storage.value.repositories[entryIndex].integrations;
    const parsedIntegrations = repo.private ? await _parseIntegrations(fullName) : {};
    integrations = { ...initialIntegrations, ...integrations, ...parsedIntegrations };

    storage.value.repositories[entryIndex] = { ...repo, dependencies, integrations };
  }
  function updateRepositories() {
    for (const repo of storage.value.repositories) updateRepository(repo.full_name, repo.integrations);
    storage.value.lastUpdate = dayjs().toISOString();
  }

  function importRepositories(repositories: Repository[]) {
    for (const { id, full_name, integrations } of repositories) {
      _isRepoExists(id) ? updateRepository(full_name, integrations) : addRepository(full_name, integrations);
    }
  }
  function exportRepositories() {
    const repos: ExportedRepository[] = storage.value.repositories.map(
      ({ id, full_name, integrations }) => ({ id, full_name, integrations })
    );
    return JSON.stringify(repos, null, 2);
  }

  return {
    storage,
    addRepository,
    deleteRepository,
    updateRepository,
    updateRepositories,
    importRepositories,
    exportRepositories
  };
}

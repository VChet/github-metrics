import { useLocalStorage } from "@vueuse/core";
import dayjs from "dayjs";
import type { PackageJson } from "type-fest";
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
  const storage = useLocalStorage<RepositoriesStore>("repositories", DEFAULT_STORE, { mergeDefaults: true });

  function _isRepoExists(id: Repository["id"]): boolean {
    return storage.value.repositories.some(({ id: repoId }) => repoId === id);
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

    storage.value.repositories.push({ ...repo, dependencies, integrations });
  }

  function deleteRepository(id: Repository["id"]): void {
    storage.value.repositories = storage.value.repositories.filter((repo) => repo.id !== id);
  }

  async function updateRepository(fullName: Repository["full_name"], integrations: Repository["integrations"]): Promise<void> {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");

    const dependencies = repo.language ? await _parseDependencies(fullName) : null;
    const workflowBadge = !repo.private ? await _parseWorkflows(fullName) : undefined;
    integrations.workflowBadge = workflowBadge;

    const entryIndex = storage.value.repositories.findIndex(({ id }) => id === repo.id);
    storage.value.repositories[entryIndex] = { ...repo, dependencies, integrations };
  }
  function updateRepositories(): void {
    for (const repo of storage.value.repositories) updateRepository(repo.full_name, repo.integrations);
    storage.value.lastUpdate = dayjs().toISOString();
  }

  function importRepositories(repositories: Repository[]): void {
    for (const { id, full_name, integrations } of repositories) {
      _isRepoExists(id) ? updateRepository(full_name, integrations) : addRepository(full_name, integrations);
    }
  }
  function exportRepositories(): string {
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

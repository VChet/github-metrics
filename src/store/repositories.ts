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
  function _parseDependencies(
    dependencies: Record<string, string>
  ): Pick<Repository["integrations"], "bundler" | "tests"> {
    let bundler;
    let tests;
    for (const lib in dependencies) {
      if (!bundler && ["vite", "rollup", "webpack"].includes(lib)) {
        bundler = lib;
      } else if (!tests && ["jest", "mocha", "vitest"].includes(lib)) {
        tests = lib;
      }
    }
    return { bundler, tests };
  }
  async function _parseIntegrations(
    { language, private: isPrivate }: Pick<Repository, "language" | "private">,
    fullName: Repository["full_name"]
  ): Promise<Repository["integrations"]> {
    let integrations: Repository["integrations"] = {};
    if (language) {
      const dependencies = await fetchRepositoryPackages(fullName);
      if (dependencies) integrations = { ...integrations, ..._parseDependencies(dependencies) };
    }
    if (!isPrivate) {
      const workflowsData = await fetchRepositoryWorkflows(fullName);
      if (workflowsData?.workflows[0]) {
        const { state, badge_url: workflowBadge } = workflowsData.workflows[0];
        if (state === "active") integrations = { ...integrations, workflowBadge };
      }
    }
    return integrations;
  }

  async function addRepository(fullName: Repository["full_name"], integrations: Repository["integrations"]) {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");
    if (_isRepoExists(repo.id)) return;

    const parsedIntegrations = await _parseIntegrations(repo, fullName);
    integrations = { ...integrations, ...parsedIntegrations };

    storage.value.repositories.push({ ...repo, integrations });
  }

  function deleteRepository(id: Repository["id"]) {
    storage.value.repositories = storage.value.repositories.filter((repo) => repo.id !== id);
  }

  async function updateRepository(fullName: Repository["full_name"], integrations: Repository["integrations"]) {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");

    const entryIndex = storage.value.repositories.findIndex(({ id }) => id === repo.id);
    const initialIntegrations = storage.value.repositories[entryIndex].integrations;
    const parsedIntegrations = await _parseIntegrations(repo, fullName);
    integrations = { ...initialIntegrations, ...integrations, ...parsedIntegrations };

    storage.value.repositories[entryIndex] = { ...repo, integrations };
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

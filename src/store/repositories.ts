import { computed } from "vue";
import { isObject, useLocalStorage } from "@vueuse/core";
import dayjs from "dayjs";
import { fetchRepo, fetchRepositoryFiles, fetchRepositoryPackages, fetchRepositoryWorkflows } from "@/service/octokit";
import type { Repository } from "@/composable/useRepo";

interface RepositoriesStore {
  lastUpdate: string
  data: Repository[]
};

export type ExportedRepository = Pick<Repository, "id" | "full_name" | "integrations">;
export function isExportedRepository(data: unknown): data is ExportedRepository {
  return isObject(data) && "id" in data && "full_name" in data && "integrations" in data;
}

const DEFAULT_STORE: RepositoriesStore = {
  lastUpdate: dayjs().toISOString(),
  data: []
};

async function parseWorkflows(fullName: Repository["full_name"]): Promise<Repository["integrations"]["workflowBadge"]> {
  const workflowsData = await fetchRepositoryWorkflows(fullName);
  const firstWorkflow = workflowsData?.workflows[0];
  return firstWorkflow?.state === "active" ? firstWorkflow.badge_url : undefined;
}
async function parsePackageManager(fullName: Repository["full_name"]): Promise<"npm" | "pnpm" | "yarn" | undefined> {
  const files = await fetchRepositoryFiles(fullName);
  if (files.includes("package-lock.json")) return "npm";
  else if (files.includes("pnpm-lock.yaml")) return "pnpm";
  else if (files.includes("yarn.lock")) return "yarn";

  return undefined;
}

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

  function isRepoExists(id: Repository["id"]): boolean {
    return repositories.value.some(({ id: repoId }) => repoId === id);
  }

  async function addRepository(fullName: Repository["full_name"], integrations: Repository["integrations"] = {}): Promise<void> {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");
    if (isRepoExists(repo.id)) return updateRepository(fullName, integrations);

    const dependencies = repo.language ? await fetchRepositoryPackages(fullName) : null;
    integrations.workflowBadge = repo.private ? await parseWorkflows(fullName) : undefined;
    integrations.packageManager = await parsePackageManager(fullName);

    repositories.value.push({ ...repo, dependencies, integrations });
  }

  function deleteRepository(id: Repository["id"]): void {
    repositories.value = repositories.value.filter((repo) => repo.id !== id);
  }

  async function updateRepository(fullName: Repository["full_name"], integrations: Repository["integrations"]): Promise<void> {
    const repo = await fetchRepo(fullName);
    if (!repo) throw new Error("Repo not found");

    const dependencies = repo.language ? await fetchRepositoryPackages(fullName) : null;
    integrations.workflowBadge = !repo.private ? await parseWorkflows(fullName) : undefined;
    integrations.packageManager = await parsePackageManager(fullName);

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

  async function importRepositories(payload: ExportedRepository[]): Promise<void> {
    const fetchPromises = payload.map(({ id, full_name, integrations }) => isRepoExists(id) ?
      updateRepository(full_name, integrations) :
      addRepository(full_name, integrations)
    );
    await Promise.all(fetchPromises);
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

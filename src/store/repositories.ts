import { useStorage } from "@vueuse/core";
import dayjs from "dayjs";
import { fetchRepo, fetchRepositoryPackages, fetchRepositoryWorkflows } from "@/service/octokit";
import type { Repository } from "@/composable/Repo";

type RepositoriesStore = {
  lastUpdate: string
  repositories: Repository[]
};

export const storage = useStorage<RepositoriesStore>(
  "repositories",
  { lastUpdate: dayjs().toISOString(), repositories: [] },
  localStorage,
  { mergeDefaults: true }
);

function isRepoExists(id: Repository["id"]) {
  return storage.value.repositories.some(({ id: repoId }) => repoId === id);
}

function parseDependencies(
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

export async function addRepository(fullName: Repository["full_name"], integrations: Repository["integrations"]) {
  const repo = await fetchRepo(fullName);
  if (!repo) throw new Error("Repo not found");
  if (isRepoExists(repo.id)) return;

  if (repo.language) {
    const dependencies = await fetchRepositoryPackages(fullName);
    if (dependencies) integrations = { ...integrations, ...parseDependencies(dependencies) };
  }
  const workflowsData = await fetchRepositoryWorkflows(fullName);
  if (workflowsData.total_count) {
    const main = workflowsData.workflows[0];
    if (main.state === "active") integrations = { ...integrations, workflowBadge: main.badge_url };
  }

  storage.value.repositories.push({ ...repo, integrations });
}

export function deleteRepository(id: Repository["id"]) {
  storage.value.repositories = storage.value.repositories.filter((repo) => repo.id !== id);
}

export async function updateRepository(fullName: Repository["full_name"], integrations: Repository["integrations"]) {
  const repo = await fetchRepo(fullName);
  if (!repo) throw new Error("Repo not found");

  if (repo.language) {
    const dependencies = await fetchRepositoryPackages(fullName);
    if (dependencies) integrations = { ...integrations, ...parseDependencies(dependencies) };
  }
  const workflowsData = await fetchRepositoryWorkflows(fullName);
  if (workflowsData.total_count) {
    const main = workflowsData.workflows[0];
    if (main.state === "active") integrations = { ...integrations, workflowBadge: main.badge_url };
  }

  const entryIndex = storage.value.repositories.findIndex(({ id }) => id === repo.id);
  const initialIntegrations = storage.value.repositories[entryIndex].integrations;
  storage.value.repositories[entryIndex] = { ...repo, integrations: integrations ?? initialIntegrations };
}
export function updateRepositories() {
  for (const repo of storage.value.repositories) updateRepository(repo.full_name, repo.integrations);
  storage.value.lastUpdate = dayjs().toISOString();
}

type ExportedRepository = Pick<Repository, "id" | "full_name" | "integrations">;

export function importRepositories(repositories: ExportedRepository[]) {
  for (const { id, full_name, integrations } of repositories) {
    isRepoExists(id) ? updateRepository(full_name, integrations) : addRepository(full_name, integrations);
  }
}
export function exportRepositories() {
  const repos: ExportedRepository[] = storage.value.repositories.map(
    ({ id, full_name, integrations }) => ({ id, full_name, integrations })
  );
  return JSON.stringify(repos, null, 2);
}

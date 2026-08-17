import type { PackageJson } from "type-fest";
import { fetchPackageJson, fetchPnpmWorkspace, fetchRepositoryFiles, fetchWorkflowRuns } from "@/service/octokit";
import { resolveDependencies } from "./dependencies";
import { getPackageManager, type PackageManager } from "./package-manager";
import type { Repository } from "@/composable/useRepo";

export type Dependencies = Record<string, string>;

async function parseWorkflows({ full_name, default_branch }: Repository): Promise<Repository["integrations"]["ci"]> {
  const response = await fetchWorkflowRuns(full_name);
  const latest = response?.workflow_runs.find(({ name, path, head_branch }) => {
    const isDependabot = name?.toLowerCase().includes("dependabot") || path.toLowerCase().includes("dependabot");
    const isMaster = head_branch === default_branch;
    return !isDependabot && isMaster;
  });
  if (!latest) return undefined;
  return { name: latest.name, status: latest.status, conclusion: latest.conclusion };
}

async function parsePackageManager(
  packageJson: PackageJson,
  fullName: Repository["full_name"]
): Promise<PackageManager | undefined> {
  const manager = getPackageManager(packageJson);
  if (manager) return manager;

  const files = await fetchRepositoryFiles(fullName);
  if (files.includes("package-lock.json")) return "npm";
  if (files.includes("pnpm-lock.yaml")) return "pnpm";
  if (files.includes("yarn.lock")) return "yarn";
  return undefined;
}

export async function populateRepositoryData(repo: Repository): Promise<Repository> {
  const packageJson = await fetchPackageJson(repo.full_name);

  const packageManager = packageJson ? await parsePackageManager(packageJson, repo.full_name) : undefined;
  const pnpmWorkspace = packageManager === "pnpm" ? await fetchPnpmWorkspace(repo.full_name) : undefined;
  const dependencies = packageJson ? resolveDependencies(packageJson, pnpmWorkspace) : undefined;

  const integrations: Repository["integrations"] = {
    ...repo.integrations,
    ci: await parseWorkflows(repo),
    packageManager
  };

  return { ...repo, dependencies, integrations };
}

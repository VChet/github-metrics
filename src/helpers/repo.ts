import dayjs from "dayjs";
import type { PackageJson } from "type-fest";
import { fetchPackageJson, fetchRepositoryFiles, fetchRepositoryWorkflows } from "@/service/octokit";
import { getDependencies, getPackageManager, type PackageManager } from "./packageJson";
import type { Repository } from "@/composable/useRepo";
import type { Workflow } from "@/types/repo";

async function parseWorkflows(fullName: Repository["full_name"]): Promise<Repository["integrations"]["workflowPath"]> {
  const workflowsData = await fetchRepositoryWorkflows(fullName);
  const latest = workflowsData?.workflows.reduce<Workflow | undefined>((best, workflow) => {
    const { name, path } = workflow;
    const isDependabot = name.toLowerCase().includes("dependabot") || path.toLowerCase().includes("dependabot");

    if (isDependabot || workflow.state !== "active") return best;
    if (!best) return workflow;

    return dayjs(workflow.updated_at).isAfter(best.updated_at) ? workflow : best;
  }, undefined);

  return latest?.path;
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

export async function populateRepositoryData(repo: Omit<Repository, "dependencies">): Promise<Repository> {
  const packageJson = await fetchPackageJson(repo.full_name);
  const dependencies = packageJson ? getDependencies(packageJson) : null;

  const integrations = {
    ...repo.integrations,
    workflowPath: !repo.private ? await parseWorkflows(repo.full_name) : undefined,
    packageManager: packageJson ? await parsePackageManager(packageJson, repo.full_name) : undefined
  };

  return { ...repo, dependencies, integrations };
}

import { ref } from "vue";
import { useMemoize } from "@vueuse/core";
import { Octokit } from "@octokit/core";
import { StatusCodes } from "http-status-codes";
import type { RequestParameters, Route } from "@octokit/types";
import type { PackageJson } from "type-fest";
import { parsePnpmWorkspace, type PnpmWorkspace } from "@/helpers/pnpm-workspace";
import { isRequestError } from "@/helpers/validate";
import { useSettingsStore } from "@/store/settings";
import type { Repository } from "@/composable/useRepo";
import type {
  RateLimitResponse,
  RepoContentsResponse,
  RepoEventsResponse,
  RepoResponse,
  UserReposResponse,
  UserResponse,
  WorkflowRunsResponse
} from "@/types/api/octokit";

const { settings } = useSettingsStore();

let octokit: Octokit;
export const rateLimit = ref("-");

export async function setAuthToken(authToken: string | null): Promise<void> {
  octokit = new Octokit({ auth: authToken });
  octokit.hook.after("request", (response) => {
    const limitRemaining = response.headers["x-ratelimit-remaining"];
    if (limitRemaining) { rateLimit.value = limitRemaining; }
  });
  await fetchRateLimit();
}
setAuthToken(settings.value.authToken);

export function fetch<T>(url: Route, options: RequestParameters = {}): Promise<T> {
  const NO_CACHE_LIMIT = 4000;
  const bypassCache: boolean = Number(rateLimit.value) > NO_CACHE_LIMIT;
  return octokit.request(url, {
    ...options,
    headers: bypassCache ? { "If-None-Match": "" } : undefined
  }) as Promise<T>;
}

export async function fetchRateLimit() {
  const { data } = await fetch<RateLimitResponse>("GET /rate_limit");
  rateLimit.value = data.rate.remaining.toString() ?? "-";
}

export async function fetchRepo(fullName: Repository["full_name"]) {
  const { data } = await fetch<RepoResponse>(`GET /repos/${fullName}`);
  return data;
}

async function fetchRepositoryContents(fullName: Repository["full_name"]) {
  const { data } = await fetch<RepoContentsResponse>(`GET /repos/${fullName}/contents`);
  return data;
}

export const fetchRepositoryFiles = useMemoize(async (fullName: Repository["full_name"]) => {
  try {
    const files = await fetchRepositoryContents(fullName);
    return Array.isArray(files) ? files.map(({ name }) => name) : [];
  } catch (error: unknown) {
    if (isRequestError(error) && error.status !== StatusCodes.NOT_FOUND) console.error(error);
    return [];
  }
});

async function fetchRepositoryFile(fullName: Repository["full_name"], fileName: string) {
  const { data } = await fetch<RepoContentsResponse>(`GET /repos/${fullName}/contents/${fileName}`);
  if ("content" in data) return atob(data.content);
  throw new Error("Invalid file");
}

export async function fetchPackageJson(fullName: Repository["full_name"]): Promise<PackageJson | undefined> {
  try {
    const hasPackage: boolean = await fetchRepositoryFiles(fullName).then((files) => files.includes("package.json"));
    if (!hasPackage) return undefined;
    const packageContents = await fetchRepositoryFile(fullName, "package.json");
    const content = JSON.parse(packageContents) as PackageJson;
    return content;
  } catch (error: unknown) {
    if (isRequestError(error) && error.status !== StatusCodes.NOT_FOUND) console.error(error);
    return undefined;
  }
}

export async function fetchPnpmWorkspace(fullName: Repository["full_name"]): Promise<PnpmWorkspace | undefined> {
  try {
    const hasWorkspace: boolean = await fetchRepositoryFiles(fullName).then((files) => files.includes("pnpm-workspace.yaml"));
    if (!hasWorkspace) return undefined;
    const workspaceContents = await fetchRepositoryFile(fullName, "pnpm-workspace.yaml");
    return parsePnpmWorkspace(workspaceContents);
  } catch (error: unknown) {
    if (isRequestError(error) && error.status !== StatusCodes.NOT_FOUND) console.error(error);
    return undefined;
  }
}

export async function fetchWorkflowRuns(fullName: Repository["full_name"]) {
  try {
    const { data } = await fetch<WorkflowRunsResponse>(`GET /repos/${fullName}/actions/runs`);
    return data;
  } catch (error: unknown) {
    if (isRequestError(error) && error.status !== StatusCodes.NOT_FOUND) console.error(error);
    return null;
  }
}

export async function fetchRepositoryEvents(fullName: Repository["full_name"], page = 1) {
  const { data } = await fetch<RepoEventsResponse>(`GET /repos/${fullName}/events`, { per_page: 100, page });
  if (!Array.isArray(data)) throw new Error(`Error fetching ${fullName} repo events`, data);
  return { data };
}

export async function fetchCurrentUser() {
  if (!settings.value.authToken) return console.warn("empty authToken");
  const { data } = await fetch<UserResponse>("GET /user");
  return data;
}

export async function fetchCurrentUserRepos() {
  if (!settings.value.authToken) return console.warn("empty authToken");
  const { data } = await fetch<UserReposResponse>("GET /user/repos", { affiliation: "owner" });
  return data;
}

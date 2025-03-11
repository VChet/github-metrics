import { ref } from "vue";
import { useMemoize } from "@vueuse/core";
import { Octokit } from "@octokit/core";
import { StatusCodes } from "http-status-codes";
import type { RequestError, RequestParameters, Route } from "@octokit/types";
import type { PackageJson } from "type-fest";
import { useSettingsStore } from "@/store/settings";
import type {
  RateLimitResponse,
  RepoContentsResponse,
  RepoResponse,
  UserReceivedEventsResponse,
  UserReposResponse,
  UserResponse,
  WorkflowsResponse
} from "@/types/repo";

const { settings } = useSettingsStore();

let octokit: Octokit;
export const rateLimit = ref("-");

setAuthToken(settings.value.authToken);

export async function setAuthToken(authToken: string | null): Promise<void> {
  settings.value.authToken = authToken ?? "";
  octokit = new Octokit({ auth: authToken });
  octokit.hook.after("request", (response) => {
    rateLimit.value = response.headers["x-ratelimit-remaining"] ?? "-";
  });
  await fetchRateLimit();
}

export function fetch(url: Route, options: RequestParameters = {}): Promise<any> {
  const NO_CACHE_LIMIT = 4000;
  const bypassCache: boolean = Number(rateLimit.value) > NO_CACHE_LIMIT;
  return octokit.request(url, {
    ...options,
    headers: bypassCache ? { "If-None-Match": "" } : undefined
  });
}

export async function fetchRateLimit() {
  const { data } = await fetch("GET /rate_limit") as RateLimitResponse;
  rateLimit.value = data.rate.remaining.toString() ?? "-";
}

export async function fetchRepo(fullName: string) {
  const { data } = await fetch(`GET /repos/${fullName}`) as RepoResponse;
  return data;
}

async function fetchRepositoryContents(fullName: string) {
  const { data } = await fetch(`GET /repos/${fullName}/contents`) as RepoContentsResponse;
  return data;
}

export const fetchRepositoryFiles = useMemoize(async (fullName: string) => {
  try {
    const files = await fetchRepositoryContents(fullName);
    return Array.isArray(files) ? files.map(({ name }) => name) : [];
  } catch (error: unknown) {
    if ((error as RequestError).status !== StatusCodes.NOT_FOUND) console.error(error);
    return [];
  }
});

async function fetchRepositoryFile(fullName: string, fileName: string) {
  const { data } = await fetch(`GET /repos/${fullName}/contents/${fileName}`) as RepoContentsResponse;
  if ("content" in data) return atob(data.content);
  throw new Error("Invalid file");
}

export async function fetchRepositoryPackages(fullName: string): Promise<PackageJson.Dependency | null> {
  try {
    const hasPackage: boolean = await fetchRepositoryFiles(fullName).then((files) => files.includes("package.json"));
    if (!hasPackage) return null;
    const packageContents = await fetchRepositoryFile(fullName, "package.json");
    const content = JSON.parse(packageContents) as PackageJson;
    return { ...content.dependencies, ...content.devDependencies };
  } catch (error: unknown) {
    if ((error as RequestError).status !== StatusCodes.NOT_FOUND) console.error(error);
    return null;
  }
}

export async function fetchRepositoryWorkflows(fullName: string) {
  try {
    const { data } = await fetch(`GET /repos/${fullName}/actions/workflows`) as WorkflowsResponse;
    return data;
  } catch (error: unknown) {
    if ((error as RequestError).status !== StatusCodes.NOT_FOUND) console.error(error);
    return null;
  }
}

export async function fetchCurrentUser() {
  if (!settings.value.authToken) return console.warn("empty authToken");
  const { data } = await fetch("GET /user") as UserResponse;
  return data;
}

export async function fetchCurrentUserRepos() {
  if (!settings.value.authToken) return console.warn("empty authToken");
  const { data } = await fetch("GET /user/repos", { affiliation: "owner" }) as UserReposResponse;
  return data;
}

export async function fetchCurrentUserReceivedEvents(page = 1) {
  if (!settings.value.authToken) throw new Error("empty authToken");
  if (!settings.value.username) throw new Error("empty username");
  const { data, headers } = await fetch(`GET /users/${settings.value.username}/received_events`, { per_page: 100, page }) as UserReceivedEventsResponse;
  if (!Array.isArray(data)) throw new Error("Error fetching user received events", data);

  return {
    data,
    hasNextPage: !!headers.link?.includes("rel=\"next\"")
  };
}

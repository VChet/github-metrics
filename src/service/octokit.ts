import { ref } from "vue";
import { Octokit } from "@octokit/core";
import type { RequestError, RequestParameters, Route } from "@octokit/types";
import { StatusCodes } from "http-status-codes";
import type { PackageJson } from "type-fest";
import { repositoryContents } from "./memoize";
import { useSettingsStore } from "@/store/settings";
import type {
  RepositoryResponse,
  User,
  UserReceivedEventsResponse,
  UserRepositoriesResponse,
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

export async function fetchRateLimit(): Promise<void> {
  const response = await fetch("GET /rate_limit");
  rateLimit.value = response.data.rate.remaining.toString() ?? "-";
}

export async function fetchRepo(fullName: string): Promise<RepositoryResponse | void> {
  const { data } = await fetch(`GET /repos/${fullName}`);
  return data;
}

export function fetchRepositoryContents(fullName: string): Promise<unknown[]> {
  return repositoryContents(fullName);
}

export async function fetchRepositoryPackages(fullName: string): Promise<PackageJson.Dependency | null> {
  try {
    const hasPackage: boolean = await repositoryContents(fullName).then((files) => files.includes("package.json"));
    if (!hasPackage) { return null; }
    const { data } = await fetch(`GET /repos/${fullName}/contents/package.json`);
    if (!("content" in data)) return null;
    const content: PackageJson = JSON.parse(atob(data.content));
    return { ...content.dependencies, ...content.devDependencies };
  } catch (error: unknown) {
    if ((error as RequestError).status !== StatusCodes.NOT_FOUND) console.error(error);
    return null;
  }
}

export async function fetchRepositoryWorkflows(fullName: string): Promise<WorkflowsResponse | null> {
  try {
    const { data } = await fetch(`GET /repos/${fullName}/actions/workflows`);
    return data;
  } catch (error: unknown) {
    if ((error as RequestError).status !== StatusCodes.NOT_FOUND) console.error(error);
    return null;
  }
}

export async function fetchCurrentUser(): Promise<User | void> {
  if (!settings.value.authToken) return console.warn("empty authToken");
  const { data } = await fetch("GET /user");
  return data;
}

export async function fetchCurrentUserRepos(): Promise<UserRepositoriesResponse | void> {
  if (!settings.value.authToken) return console.warn("empty authToken");
  const { data } = await fetch("GET /user/repos", { affiliation: "owner" });
  return data;
}

export async function fetchCurrentUserReceivedEvents(page: number = 0): Promise<{ data: UserReceivedEventsResponse, hasNextPage: boolean } | void> {
  if (!settings.value.authToken) throw new Error("empty authToken");
  if (!settings.value.username) throw new Error("empty username");
  const { data, headers } = await fetch(`GET /users/${settings.value.username}/received_events`, { per_page: 100, page });
  if (!Array.isArray(data)) throw new Error("Error fetching user received events", data);

  return {
    data,
    hasNextPage: !!headers.link?.includes("rel=\"next\"")
  };
}

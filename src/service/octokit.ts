import { ref } from "vue";
import { Octokit } from "@octokit/core";
import { settings } from "@/store/settings";
import type {
  RepositoryResponse,
  UserReceivedEventsResponse,
  UserRepositoriesResponse,
  WorkflowsResponse
} from "@/types/repo";

let octokit: Octokit;
export const rateLimit = ref("-");

setAuthToken(settings.value.authToken);

export async function setAuthToken(auth: string | null) {
  settings.value.authToken = auth ?? "";
  octokit = new Octokit({ auth });
  octokit.hook.after("request", (response) => {
    rateLimit.value = response.headers["x-ratelimit-remaining"] ?? "-";
  });
  await fetchRateLimit();
}

export async function fetchRateLimit() {
  const response = await octokit.request("GET /rate_limit");
  rateLimit.value = response.data.rate.remaining.toString() ?? "-";
}

export async function fetchRepo(fullName: string): Promise<RepositoryResponse | void> {
  const { data } = await octokit.request(`GET /repos/${fullName}`);
  return data;
}

export async function fetchRepositoryPackages(fullName: string): Promise<Record<string, string> | null> {
  try {
    const response = await octokit.request(`GET /repos/${fullName}/contents/package.json`);
    if (!("content" in response.data)) return null;
    const content = JSON.parse(atob(response.data.content));
    return { ...content.dependencies, ...content.devDependencies };
  } catch (error) {
    return null;
  }
}

export async function fetchRepositoryWorkflows(fullName: string): Promise<WorkflowsResponse> {
  const { data } = await octokit.request(`GET /repos/${fullName}/actions/workflows`);
  return data;
}

export async function fetchCurrentUserRepos(): Promise<UserRepositoriesResponse | void> {
  if (!settings.value.authToken) return console.warn("empty authToken");
  const { data } = await octokit.request("GET /user/repos", { affiliation: "owner" });
  return data;
}

export async function fetchCurrentUserReceivedEvents(page: number = 0): Promise<{ data: UserReceivedEventsResponse, hasNextPage: boolean } | void> {
  if (!settings.value.authToken) throw new Error("empty authToken");
  if (!settings.value.username) throw new Error("empty username");
  const { data, headers } = await octokit.request(`GET /users/${settings.value.username}/received_events`, { per_page: 100, page });
  if (!Array.isArray(data)) throw new Error("Error fetching user received events", data);

  return {
    data,
    hasNextPage: !!headers.link?.includes("rel=\"next\"")
  };
}

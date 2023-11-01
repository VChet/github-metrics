import { ref } from "vue";
import { Octokit } from "@octokit/core";
import { settings } from "@/store/settings";
import { RepositoryResponse, UserRepositoriesResponse } from "@/types/repo";

export const rateLimit = ref("-");

export let octokit = new Octokit({ auth: settings.value.authToken });

export async function setAuthToken(token: string) {
  octokit = new Octokit({ auth: token });
  await fetchRateLimit();
  settings.value.authToken = token;
}

export async function fetchRateLimit() {
  const response = await octokit.request("GET /rate_limit");
  rateLimit.value = response.data.rate.remaining.toString() ?? "-";
}

export async function fetchRepo(fullName: string): Promise<RepositoryResponse | void> {
  const response = await octokit.request(`GET /repos/${fullName}`);
  rateLimit.value = response.headers["x-ratelimit-remaining"] ?? "-";
  return response.data;
}

export async function fetchCurrentUserRepos(): Promise<UserRepositoriesResponse | void> {
  if (!settings.value.authToken) return console.warn("empty authToken");
  const response = await octokit.request("GET /user/repos", { affiliation: "owner" });
  rateLimit.value = response.headers["x-ratelimit-remaining"] ?? "-";
  return response.data;
}

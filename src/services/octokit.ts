import { ref } from "vue";
import { Octokit } from "@octokit/core";
import { settings } from "@/store/settings";
import { RepositoryResponse } from "@/types/repo";

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

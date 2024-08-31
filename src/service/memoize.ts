import { useMemoize } from "@vueuse/core";
import { StatusCodes } from "http-status-codes";
import type { RequestError } from "@octokit/types";
import { fetch } from "./octokit";

export const repositoryContents = useMemoize(async (fullName: string) => {
  try {
    const { data } = await fetch(`GET /repos/${fullName}/contents`);
    return Array.isArray(data) ? data.map((file) => file.name) : [];
  } catch (error: unknown) {
    if ((error as RequestError).status !== StatusCodes.NOT_FOUND) console.error(error);
    return [];
  }
});

export function clearCachedRequests() {
  repositoryContents.clear();
}

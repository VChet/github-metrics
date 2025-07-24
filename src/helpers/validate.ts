import type { RequestError } from "@octokit/types";

export function isValidJSON(payload: string): boolean {
  try {
    JSON.parse(payload);
    return true;
  } catch {
    return false;
  }
}

export function isRequestError(payload: unknown): payload is RequestError {
  return !!payload && typeof payload === "object" && "status" in payload;
}

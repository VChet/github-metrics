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

export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

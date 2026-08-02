import type { Endpoints } from "@octokit/types";

type NumberId<T> = T extends { id: unknown } ? Omit<T, "id"> & { id: number } : T;
type PatchResponseData<T extends { data: any }> = Omit<T, "data"> & {
  data: T["data"] extends readonly (infer U)[] ? NumberId<U>[] : NumberId<T["data"]>
};

export type RateLimitResponse = Endpoints["GET /rate_limit"]["response"];

export type UserResponse = Endpoints["GET /user"]["response"];
export type UserReposResponse = PatchResponseData<Endpoints["GET /user/repos"]["response"]>;

export type RepoResponse = PatchResponseData<Endpoints["GET /repos/{owner}/{repo}"]["response"]>;
export type RepoEventsResponse = Endpoints["GET /repos/{owner}/{repo}/events"]["response"];
export type RepoContentsResponse = Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["response"];
export type WorkflowsResponse = Endpoints["GET /repos/{owner}/{repo}/actions/workflows"]["response"];

export type Workflow = WorkflowsResponse["data"]["workflows"][number];

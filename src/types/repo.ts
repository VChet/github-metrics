import type { Endpoints } from "@octokit/types";

export type RateLimitResponse = Endpoints["GET /rate_limit"]["response"];

export type UserResponse = Endpoints["GET /user"]["response"];
export type UserReposResponse = Endpoints["GET /user/repos"]["response"];
export type UserReceivedEventsResponse = Endpoints["GET /users/{username}/received_events"]["response"];

export type RepoResponse = Endpoints["GET /repos/{owner}/{repo}"]["response"];
export type RepoContentsResponse = Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["response"];
export type WorkflowsResponse = Endpoints["GET /repos/{owner}/{repo}/actions/workflows"]["response"];

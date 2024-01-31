import type { Endpoints } from "@octokit/types";

export type RepositoryResponse = Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"];
export type WorkflowsResponse = Endpoints["GET /repos/{owner}/{repo}/actions/workflows"]["response"]["data"];
export type UserRepositoriesResponse = Endpoints["GET /user/repos"]["response"]["data"];
export type UserReceivedEventsResponse = Endpoints["GET /users/{username}/received_events"]["response"]["data"];

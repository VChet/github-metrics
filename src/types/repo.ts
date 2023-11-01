import { Endpoints } from "@octokit/types";

export type RepositoryResponse = Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"];
export type UserRepositoriesResponse = Endpoints["GET /user/repos"]["response"]["data"];

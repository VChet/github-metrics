import { Endpoints } from "@octokit/types";

export type RepositoryResponse = Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"];

import { fetchRepo } from "@/services/octokit";
import { RepositoryResponse } from "@/types/repo";

export class Repository {
  id: RepositoryResponse["id"];
  name: RepositoryResponse["name"];
  full_name: RepositoryResponse["full_name"];
  html_url: RepositoryResponse["html_url"];
  is_template: RepositoryResponse["is_template"];
  language: RepositoryResponse["language"];
  homepage: RepositoryResponse["homepage"];
  forks_count: RepositoryResponse["forks_count"];
  stargazers_count: RepositoryResponse["stargazers_count"];
  open_issues_count: RepositoryResponse["open_issues_count"];
  constructor(data: RepositoryResponse) {
    this.id = data.id;
    this.name = data.name;
    this.full_name = data.full_name;
    this.html_url = data.html_url;
    this.is_template = data.is_template;
    this.language = data.language;
    this.homepage = data.homepage;
    this.forks_count = data.forks_count;
    this.stargazers_count = data.stargazers_count;
    this.open_issues_count = data.open_issues_count;
  }

  async update() {
    const data = await fetchRepo(this.full_name);
    if (data) {
      this.forks_count = data.forks_count;
      this.stargazers_count = data.stargazers_count;
      this.open_issues_count = data.open_issues_count;
    }
  }

  static async init(fullName: string) {
    const repo = await fetchRepo(fullName);
    if (repo) return new Repository(repo);
  }
}

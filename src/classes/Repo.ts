import { fetchRepo } from "@/services/octokit";
import { RepositoryResponse } from "@/types/repo";

interface Integrations {
  uptimerobotKey?: string;
  hostingProjectId?: string;
  bundler?: string;
  analytics?: string;
  tests?: string;
}

export class Repository {
  id: RepositoryResponse["id"];
  name: RepositoryResponse["name"];
  full_name: RepositoryResponse["full_name"];
  html_url: RepositoryResponse["html_url"];
  is_template: RepositoryResponse["is_template"];
  language: RepositoryResponse["language"];
  homepage: RepositoryResponse["homepage"];
  license: RepositoryResponse["license"];
  forks_count: RepositoryResponse["forks_count"];
  stargazers_count: RepositoryResponse["stargazers_count"];
  open_issues_count: RepositoryResponse["open_issues_count"];
  integrations: Integrations = {};
  constructor(data: RepositoryResponse, integrations?: Integrations) {
    this.id = data.id;
    this.name = data.name;
    this.full_name = data.full_name;
    this.html_url = data.html_url;
    this.is_template = data.is_template;
    this.language = data.language;
    this.homepage = data.homepage;
    this.license = data.license;
    this.forks_count = data.forks_count;
    this.stargazers_count = data.stargazers_count;
    this.open_issues_count = data.open_issues_count;
    if (integrations) this.integrations = integrations;
  }

  get hostingName(): string | null {
    if (!this.homepage) return null;
    if (this.homepage.includes("vercel.app")) {
      return "Vercel";
    } else if (this.homepage.includes("netlify.app")) {
      return "Netlify";
    } else if (this.homepage.includes("github.io")) {
      return "GitHub";
    }
    return null;
  }
  get uptimerobotImage(): string | null {
    if (!this.integrations.uptimerobotKey) return null;
    return `https://img.shields.io/uptimerobot/ratio/${this.integrations.uptimerobotKey}`;
  }
  get hostingStatusImage(): string | null {
    if (!this.integrations.hostingProjectId) return null;
    switch (this.hostingName) {
      case "Netlify":
        return `https://img.shields.io/netlify/${this.integrations.hostingProjectId}?color=00C7B7`;
      default:
        return null;
    }
  }
  get bundlerImage(): string | null {
    switch (this.integrations.bundler) {
      case "vite":
        return "https://img.shields.io/badge/vite-646cff";
      default:
        return null;
    }
  }
  get analyticsImage(): string | null {
    if (!this.integrations.analytics) return null;
    switch (this.integrations.analytics) {
      case "counter.dev":
        return "https://img.shields.io/badge/counter.dev-147efb";
      default:
        return null;
    }
  }
  get testsImage(): string | null {
    if (!this.integrations.tests) return null;
    switch (this.integrations.tests) {
      case "mocha":
        return "https://img.shields.io/badge/mocha-8d6748";
      case "jest":
        return "https://img.shields.io/badge/jest-c21325";
      case "vitest":
        return "https://img.shields.io/badge/vitest-eab308";
      default:
        return null;
    }
  }

  async update() {
    const data = await fetchRepo(this.full_name);
    if (data) {
      this.forks_count = data.forks_count;
      this.stargazers_count = data.stargazers_count;
      this.open_issues_count = data.open_issues_count;
    }
  }

  static async init(fullName: string, integrations?: Integrations) {
    const repo = await fetchRepo(fullName);
    if (repo) return new Repository(repo, integrations);
  }
}

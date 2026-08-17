import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { getRunState } from "@/helpers/ci";
import type { PackageManager } from "@/helpers/package-manager";
import type { Dependencies } from "@/helpers/repo";
import type { RepoResponse, WorkflowRun } from "@/types/api/octokit";

interface Integrations {
  uptimerobotKey?: string
  hostingProjectId?: string
  analytics?: string
}
interface RepositoryMeta {
  dependencies: Dependencies | undefined
  integrations: Integrations
  // Auto-detected
  packageManager?: PackageManager
  ci?: {
    name: WorkflowRun["name"]
    status: WorkflowRun["status"]
    conclusion: WorkflowRun["conclusion"]
  }
}
export type Repository = RepoResponse["data"] & RepositoryMeta;

const BUNDLERS = [
  "esbuild",
  "parcel",
  "rollup",
  "rspack",
  "tsdown",
  "tsup",
  "unbuild",
  "vite",
  "webpack"
];
const TEST_FRAMEWORKS = [
  "ava",
  "bench",
  "cypress",
  "jest",
  "mocha",
  "playwright",
  "tap",
  "uvu",
  "vitest",
  "zora"
];

function composeBadgeUrl(base: string): URL["href"] {
  const url = new URL(base);
  url.searchParams.set("style", "flat-square");
  return url.href;
}

const TOP_LEVEL_DOMAIN_REGEX = /\w+\.\w+$/;
export function useRepository(payload: MaybeRefOrGetter<Repository>) {
  const data = computed(() => toValue(payload));
  const hostingName = computed<string | null>(() => {
    if (!data.value.homepage) return null;
    try {
      const { hostname } = new URL(data.value.homepage);
      const match = TOP_LEVEL_DOMAIN_REGEX.exec(hostname);
      return match ? match[0] : null;
    } catch {
      return null;
    }
  });
  const uptimeRobotBadge = computed<string | null>(() => {
    const key = data.value.integrations?.uptimerobotKey;
    if (!key) return null;
    return composeBadgeUrl(`https://img.shields.io/uptimerobot/ratio/${key}`);
  });
  const hostingStatusBadge = computed<string | null>(() => {
    const projectId = data.value.integrations?.hostingProjectId;
    if (!projectId) return null;
    if (hostingName.value?.includes("netlify")) return composeBadgeUrl(`https://img.shields.io/netlify/${projectId}`);
    return null;
  });
  const packageManager = computed<string | null>(() => data.value.packageManager ?? null);
  const license = computed<string | null>(() => {
    if (!data.value.license) return null;
    if (data.value.license.spdx_id === "NOASSERTION") { return data.value.license.name; }
    return data.value.license.spdx_id;
  });

  const hasBadges = computed<boolean>(() => !!hostingStatusBadge.value || !!uptimeRobotBadge.value);

  const ci = computed<{ title: string, state: string } | undefined>(() => {
    if (!data.value.ci) return undefined;
    return {
      title: `${data.value.ci.name ?? "CI"}: ${data.value.ci.conclusion ?? "unknown"}`,
      state: getRunState(data.value.ci)
    };
  });

  const bundler = computed<string[]>(() => {
    if (!data.value.dependencies) { return []; }
    return Object.keys(data.value.dependencies).filter((dep) => BUNDLERS.includes(dep));
  });
  const testFramework = computed<string[]>(() => {
    if (!data.value.dependencies) { return []; }
    return Object.keys(data.value.dependencies).filter((dep) => TEST_FRAMEWORKS.includes(dep));
  });

  return {
    hostingName,
    uptimeRobotBadge,
    hostingStatusBadge,
    packageManager,
    license,
    hasBadges,
    ci,
    bundler,
    testFramework
  };
}

import { computed, type Ref } from "vue";
import type { PackageJson, Simplify } from "type-fest";
import type { RepoResponse } from "@/types/repo";

interface Integrations {
  uptimerobotKey?: string
  hostingProjectId?: string
  analytics?: string
  // Auto-detected
  workflowBadge?: string
  packageManager?: string
}

export type Repository = Simplify<RepoResponse["data"] & {
  dependencies: NonNullable<PackageJson.Dependency> | null
  integrations: Integrations
}>;

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

export function useRepository(data: Ref<Repository>) {
  const hostingName = computed<string | null>(() => {
    if (!data.value.homepage) return null;
    try {
      const { hostname } = new URL(data.value.homepage);
      const match = /\w+\.\w+$/.exec(hostname); // Match top-level domain
      return match ? match[0] : null;
    } catch {
      return null;
    }
  });
  const uptimerobotBadge = computed<string | null>(() => {
    if (!data.value.integrations?.uptimerobotKey) return null;
    return `https://img.shields.io/uptimerobot/ratio/${data.value.integrations.uptimerobotKey}`;
  });
  const hostingStatusBadge = computed<string | null>(() => {
    if (!data.value.integrations?.hostingProjectId) return null;
    if (hostingName.value?.includes("netlify")) {
      return `https://api.netlify.com/api/v1/badges/${data.value.integrations.hostingProjectId}/deploy-status`;
    }
    return null;
  });
  const workflowBadge = computed<string | null>(() => data.value.integrations.workflowBadge ?? null);
  const packageManager = computed<string | null>(() => data.value.integrations.packageManager ?? null);
  const license = computed<string | null>(() => {
    if (!data.value.license) return null;
    if (data.value.license.spdx_id === "NOASSERTION") { return data.value.license.name; }
    return data.value.license.spdx_id;
  });

  const hasBadges = computed<boolean>(() => {
    return !!hostingStatusBadge.value || !!uptimerobotBadge.value || !!workflowBadge.value;
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
    uptimerobotBadge,
    hostingStatusBadge,
    workflowBadge,
    packageManager,
    license,
    hasBadges,
    bundler,
    testFramework
  };
}

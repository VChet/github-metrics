import { computed, type Ref } from "vue";
import type { PackageJson } from "type-fest";
import type { RepositoryResponse } from "@/types/repo";

interface Integrations {
  uptimerobotKey?: string
  hostingProjectId?: string
  analytics?: string
  // Auto-detected
  workflowBadge?: string
  packageManager?: string
}

export interface Repository extends RepositoryResponse {
  dependencies: NonNullable<PackageJson.Dependency> | null
  integrations: Integrations
}

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
    if (!data.value.license || data.value.license.spdx_id === "NOASSERTION") return null;
    return data.value.license.spdx_id;
  });

  const hasBadges = computed<boolean>(() => {
    return !!hostingStatusBadge.value || !!uptimerobotBadge.value || !!workflowBadge.value;
  });

  const bundler = computed<string | null>(() => {
    if (!data.value.dependencies) { return null; }
    return Object.keys(data.value.dependencies).find((dep) => ["vite", "rollup", "webpack"].includes(dep)) ?? null;
  });
  const testFramework = computed<string | null>(() => {
    if (!data.value.dependencies) { return null; }
    return Object.keys(data.value.dependencies).find((dep) => ["jest", "mocha", "vitest"].includes(dep)) ?? null;
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

import { type Ref, computed } from "vue";
import type { RepositoryResponse } from "@/types/repo";

interface Integrations {
  uptimerobotKey?: string
  hostingProjectId?: string
  analytics?: string
  // Auto-detected
  workflowBadge?: string
}

export interface Repository extends RepositoryResponse {
  dependencies: Record<string, string> | null
  integrations: Integrations
}

export function useRepository(data: Ref<Repository>) {
  const hostingName = computed<string | null>(() => {
    if (!data.value.homepage) return null;
    try {
      const hostname = new URL(data.value.homepage).hostname;
      const match = /\w+\.\w+$/.exec(hostname); // Match top-level domain
      return match ? match[0] : null;
    } catch (error) {
      return null;
    }
  });
  const uptimerobotImage = computed<string | null>(() => {
    if (!data.value.integrations?.uptimerobotKey) return null;
    return `https://img.shields.io/uptimerobot/ratio/${data.value.integrations.uptimerobotKey}`;
  });
  const hostingStatusImage = computed<string | null>(() => {
    if (!data.value.integrations?.hostingProjectId) return null;
    if (hostingName.value?.includes("netlify")) {
      return `https://api.netlify.com/api/v1/badges/${data.value.integrations.hostingProjectId}/deploy-status`;
    }
    return null;
  });
  const workflowBadge = computed<string | null>(() => data.value.integrations.workflowBadge ?? null);
  const license = computed<string | null>(() => {
    if (!data.value.license || data.value.license.spdx_id === "NOASSERTION") return null;
    return data.value.license.spdx_id;
  });

  const hasIntegrations = computed<boolean>(() => !!Object.values(data.value.integrations).filter(Boolean).length);

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
    uptimerobotImage,
    hostingStatusImage,
    workflowBadge,
    license,
    hasIntegrations,
    bundler,
    testFramework
  };
}

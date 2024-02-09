import { type Ref, computed } from "vue";
import type { RepositoryResponse } from "@/types/repo";

interface Integrations {
  uptimerobotKey?: string
  hostingProjectId?: string
  // Auto-detected
  bundler?: string
  analytics?: string
  tests?: string
  workflowBadge?: string
}

export interface Repository extends RepositoryResponse {
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

  return {
    hostingName,
    uptimerobotImage,
    hostingStatusImage,
    workflowBadge,
    license,
    hasIntegrations
  };
}

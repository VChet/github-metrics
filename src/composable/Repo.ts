import { computed, readonly, type Ref } from "vue";
import { RepositoryResponse } from "@/types/repo";

interface Integrations {
  uptimerobotKey?: string;
  hostingProjectId?: string;
  bundler?: string;
  analytics?: string;
  tests?: string;
}

export interface Repository extends RepositoryResponse {
  integrations: Integrations;
}

export function useRepository(data: Ref<Repository>) {
  const hostingName = computed<string | null>(() => {
    if (!data.value.homepage) return null;
    if (data.value.homepage.includes("vercel.app")) {
      return "Vercel";
    } else if (data.value.homepage.includes("netlify.app")) {
      return "Netlify";
    } else if (data.value.homepage.includes("github.io")) {
      return "GitHub";
    }
    return null;
  });
  const uptimerobotImage = computed<string | null>(() => {
    if (!data.value.integrations?.uptimerobotKey) return null;
    return `https://img.shields.io/uptimerobot/ratio/${data.value.integrations.uptimerobotKey}`;
  });
  const hostingStatusImage = computed<string | null>(() => {
    if (!data.value.integrations?.hostingProjectId) return null;
    if (hostingName.value === "Netlify")
      return `https://img.shields.io/netlify/${data.value.integrations.hostingProjectId}?color=00C7B7`;
    return null;
  });
  const hasIntegrations = computed<boolean>(() => !!Object.values(data.value.integrations).filter(Boolean).length);
  return {
    hostingName: readonly(hostingName),
    uptimerobotImage: readonly(uptimerobotImage),
    hostingStatusImage: readonly(hostingStatusImage),
    hasIntegrations: readonly(hasIntegrations)
  };
}

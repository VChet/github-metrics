import { createGlobalState, useLocalStorage } from "@vueuse/core";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import { useRegisterSW } from "virtual:pwa-register/vue";

type Theme = "github" | "aqua" | "cream" | "mint" | "rose" | "departure";
export interface SettingsStore {
  authToken: string
  username: string
  displayOwner: boolean
  displayBadges: boolean
  theme: Theme
}

const DEFAULT_STORE: SettingsStore = {
  authToken: "",
  username: "",
  displayOwner: true,
  displayBadges: true,
  theme: "github"
};

export const useSettingsStore = createGlobalState(() => {
  const local = useLocalStorage("settings", DEFAULT_STORE);
  const { data: settings } = useIDBKeyval<SettingsStore>("settings", local.value ?? DEFAULT_STORE, { deep: true, writeDefaults: true });

  const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true });

  function importSettings(newSettings: Partial<SettingsStore>): void {
    Object.assign(settings.value, newSettings);
  }

  function nextTheme(): void {
    const themes = ["github", "aqua", "cream", "mint", "rose", "departure"] as const satisfies readonly Theme[];
    const index = themes.indexOf(settings.value.theme);
    const nextIndex = (index + 1) % themes.length;
    settings.value.theme = themes[nextIndex];
  }

  return {
    settings,
    needRefresh,
    updateServiceWorker,
    importSettings,
    nextTheme
  };
});

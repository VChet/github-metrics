import { createGlobalState, useLocalStorage } from "@vueuse/core";
import { useRegisterSW } from "virtual:pwa-register/vue";

export type PackageBrowser = "npmjs.org" | "npmx.dev";
type Theme = "github" | "aqua" | "cream" | "mint" | "rose" | "departure";
export interface SettingsStore {
  authToken: string
  username: string
  displayOwner: boolean
  displayBadges: boolean
  packageBrowser: PackageBrowser
  theme: Theme
}

const DEFAULT_STORE: SettingsStore = {
  authToken: "",
  username: "",
  displayOwner: true,
  displayBadges: true,
  packageBrowser: "npmjs.org",
  theme: "github"
};

export const useSettingsStore = createGlobalState(() => {
  const settings = useLocalStorage<SettingsStore>("settings", DEFAULT_STORE, { mergeDefaults: true });

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

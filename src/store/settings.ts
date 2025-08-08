import { createGlobalState, useLocalStorage } from "@vueuse/core";
import { useRegisterSW } from "virtual:pwa-register/vue";

type Theme = "github" | "blue" | "beige" | "green" | "red" | "departure";
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
  const settings = useLocalStorage<SettingsStore>("settings", DEFAULT_STORE, { mergeDefaults: true });

  const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true });

  function importSettings(newSettings: Partial<SettingsStore>): void {
    Object.assign(settings.value, newSettings);
  }

  function nextTheme(): void {
    const themes: readonly Theme[] = ["github", "blue", "beige", "green", "red", "departure"];
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

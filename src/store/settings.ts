import { createSharedComposable, useLocalStorage } from "@vueuse/core";
import { useRegisterSW } from "virtual:pwa-register/vue";

type Theme = "github" | "blue" | "beige" | "green" | "red";
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

export const useSettingsStore = createSharedComposable(() => {
  const settings = useLocalStorage<SettingsStore>("settings", DEFAULT_STORE, { mergeDefaults: true });

  const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true });

  function importSettings(newSettings: Partial<SettingsStore>): void {
    Object.assign(settings.value, newSettings);
  }

  return {
    settings,
    needRefresh,
    updateServiceWorker,
    importSettings
  };
});

import { readonly } from "vue";
import { createGlobalState, useLocalStorage, useMediaQuery } from "@vueuse/core";
import { useRegisterSW } from "virtual:pwa-register/vue";

type PackageBrowser = "npmjs.org" | "npmx.dev";

const THEMES = ["github", "aqua", "cream", "mint", "rose", "departure"] as const;
type Theme = typeof THEMES[number];

export interface SettingsStore {
  authToken: string
  username: string
  displayOwner: boolean
  displayBadges: boolean
  swipeNavigator: boolean
  packageBrowser: PackageBrowser
  theme: Theme
}

const DEFAULT_STORE: SettingsStore = {
  authToken: "",
  username: "",
  displayOwner: true,
  displayBadges: true,
  swipeNavigator: true,
  packageBrowser: "npmx.dev",
  theme: "departure"
};

export const useSettingsStore = createGlobalState(() => {
  const settings = useLocalStorage<SettingsStore>("settings", DEFAULT_STORE, { mergeDefaults: true });
  const isSwipeSupported = useMediaQuery("(pointer: coarse)");

  const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true });

  function importSettings(newSettings: Partial<SettingsStore>): void {
    Object.assign(settings.value, newSettings);
  }

  function setSettings(payload: Partial<SettingsStore>): void {
    Object.assign(settings.value, payload);
  }
  function nextTheme(): void {
    const index = THEMES.indexOf(settings.value.theme);
    const nextIndex = (index + 1) % THEMES.length;
    settings.value.theme = THEMES[nextIndex];
  }

  return {
    settings: readonly(settings),
    isSwipeSupported,
    needRefresh,
    setSettings,
    updateServiceWorker,
    importSettings,
    nextTheme
  };
});

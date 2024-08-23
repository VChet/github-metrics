import { useLocalStorage } from "@vueuse/core";

type Theme = "github" | "blue" | "beige" | "green" | "red";
interface SettingsStore {
  authToken: string
  username: string
  showOwner: boolean
  showBadges: boolean
  theme: Theme
}

const DEFAULT_STORE: SettingsStore = {
  authToken: "",
  username: "",
  showOwner: true,
  showBadges: true,
  theme: "github"
};

export function useSettingsStore() {
  const settings = useLocalStorage<SettingsStore>("settings", DEFAULT_STORE, { mergeDefaults: true });
  return { settings };
}

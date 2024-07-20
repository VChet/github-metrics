import { useStorage } from "@vueuse/core";

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
  const settings = useStorage<SettingsStore>(
    "settings",
    DEFAULT_STORE,
    localStorage,
    { mergeDefaults: true }
  );
  return { settings };
}

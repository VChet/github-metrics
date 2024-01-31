import { watch } from "vue";
import { useStorage } from "@vueuse/core";
import { setAuthToken } from "@/service/octokit";

type Theme = "github" | "blue" | "beige" | "green" | "red";
interface SettingsStore {
  authToken: string
  username: string
  showOwner: boolean
  theme: Theme
}

const DEFAULT_STORE: SettingsStore = {
  authToken: "",
  username: "",
  showOwner: true,
  theme: "github"
};

export function useSettingsStore() {
  const settings = useStorage<SettingsStore>(
    "settings",
    DEFAULT_STORE,
    localStorage,
    { mergeDefaults: true }
  );

  watch(() => settings.value.authToken, (token) => {
    setAuthToken(token);
  });
  watch(() => settings.value.theme, (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  }, { immediate: true });

  return { settings };
}

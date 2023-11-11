import { watch } from "vue";
import { useStorage } from "@vueuse/core";
import { setAuthToken } from "@/service/octokit";

type Theme = "github" | "blue" | "beige" | "green" | "red";
interface SettingsStore {
  authToken: string;
  showOwner: boolean;
  theme: Theme;
}

export const settings = useStorage<SettingsStore>("settings", {
  showOwner: true,
  theme: "github",
  authToken: ""
});

watch(
  () => settings.value.authToken,
  (token) => {
    setAuthToken(token);
  }
);
watch(
  () => settings.value.theme,
  (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  },
  { immediate: true }
);

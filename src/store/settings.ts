import { useStorage } from "@vueuse/core";

interface SettingsStore {
  authToken: string;
  showOwner: boolean;
}

export const settings = useStorage<SettingsStore>("settings", {
  authToken: "",
  showOwner: true
});

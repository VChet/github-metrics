import { computed } from "vue";
import { createGlobalState, useLocalStorage } from "@vueuse/core";
import dayjs from "dayjs";
import type { ModuleReplacementMapping } from "module-replacements";
import { fetchModuleReplacements } from "@/service/replacements";

interface ReplacementsStore {
  lastUpdate: string
  data: Record<string, ModuleReplacementMapping>
}
const DEFAULT_STORE: ReplacementsStore = {
  lastUpdate: "",
  data: {}
};

export const useReplacementsStore = createGlobalState(() => {
  const storage = useLocalStorage<ReplacementsStore>("replacements", DEFAULT_STORE, { mergeDefaults: true });
  const mappings = computed({
    get: () => storage.value.data,
    set: (data) => { storage.value.data = data; }
  });
  const lastUpdate = computed({
    get: () => storage.value.lastUpdate,
    set: (data) => { storage.value.lastUpdate = data; }
  });

  async function updateReplacements(): Promise<void> {
    try {
      mappings.value = await fetchModuleReplacements();
      lastUpdate.value = new Date().toISOString();
    } catch (error) {
      console.error("Failed to update module replacements", error);
    }
  }

  function isUpdateNeeded() {
    return !lastUpdate.value || dayjs().diff(lastUpdate.value, "hours") >= 24;
  }
  if (isUpdateNeeded()) updateReplacements();

  return { mappings };
});

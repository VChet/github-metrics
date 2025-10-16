import { computed } from "vue";
import { createGlobalState, useLocalStorage, whenever } from "@vueuse/core";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import dayjs from "dayjs";
import type { PackageJson } from "type-fest";
import { useDependencyTable } from "@/composable/useDependencyTable";

interface LatestVersionsStore {
  lastUpdate: string
  data: PackageJson.Dependency
}
const DEFAULT_STORE: LatestVersionsStore = {
  lastUpdate: dayjs().toISOString(),
  data: {}
};

async function fetchLatestVersion(dependency: string): Promise<string | null> {
  const response = await fetch(`https://registry.npmjs.org/${dependency}/latest`);
  const data = await response.json() as PackageJson;
  return data.version ?? null;
};

export const useLatestVersionsStore = createGlobalState(() => {
  const local = useLocalStorage("latestVersions", DEFAULT_STORE);
  const { data: storage } = useIDBKeyval("latestVersions", local.value ?? DEFAULT_STORE, { deep: true, writeDefaults: true });
  const latestVersions = computed({
    get: () => storage.value.data,
    set: (value) => { storage.value.data = value; }
  });
  const lastUpdate = computed({
    get: () => storage.value.lastUpdate,
    set: (value) => { storage.value.lastUpdate = value; }
  });
  const isEmpty = computed(() => !Object.keys(latestVersions.value).length);

  const { dependencies } = useDependencyTable();
  async function updateLatestVersions(): Promise<void> {
    const fetchPromises = dependencies.value.map(async (dependency) => {
      const latestVersion = await fetchLatestVersion(dependency);
      if (latestVersion) latestVersions.value[dependency] = latestVersion;
    });
    await Promise.all(fetchPromises);
    lastUpdate.value = dayjs().toISOString();
  }

  function updateCheck() {
    const isUpdateNeeded = isEmpty.value || !lastUpdate.value || dayjs().diff(dayjs(lastUpdate.value), "hours") >= 1;
    if (isUpdateNeeded) return updateLatestVersions();
  }
  whenever(() => storage.value.lastUpdate, updateCheck, { immediate: true });

  return {
    latestVersions,
    updateLatestVersions
  };
});

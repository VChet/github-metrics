import { computed } from "vue";
import { createGlobalState, useLocalStorage, whenever } from "@vueuse/core";
import dayjs from "dayjs";
import { compare } from "semver";
import type { PackageJson } from "type-fest";
import { useDependencyTable } from "@/composable/useDependencyTable";
import { isVersionsObject } from "@/helpers/object";

interface LatestVersionsStore {
  lastUpdate: string
  data: Record<string, PackageJson.Dependency>
}
const DEFAULT_STORE: LatestVersionsStore = {
  lastUpdate: dayjs().toISOString(),
  data: {}
};

async function fetchTags(dependency: string): Promise<Record<string, string> | null> {
  const response = await fetch(`https://registry.npmjs.org/${dependency}`);
  if (!response.ok) return null;
  const data = await response.json() as PackageJson;
  const tags = data["dist-tags"];
  if (!isVersionsObject(tags)) return null;
  // Ignore next version if it's lower than latest
  if (tags.next && compare(tags.next, tags.latest) <= 0) delete tags.next;
  return tags;
};

export const useVersionsStore = createGlobalState(() => {
  const storage = useLocalStorage<LatestVersionsStore>("latestVersions", DEFAULT_STORE, { mergeDefaults: true });
  const versions = computed({
    get: () => storage.value.data,
    set: (value) => { storage.value.data = value; }
  });
  const lastUpdate = computed({
    get: () => storage.value.lastUpdate,
    set: (value) => { storage.value.lastUpdate = value; }
  });
  const isEmpty = computed(() => !Object.keys(versions.value).length);

  const { dependencies } = useDependencyTable();
  async function updateVersions(): Promise<void> {
    const fetchPromises = dependencies.value.map(async (dependency) => {
      const tags = await fetchTags(dependency);
      if (tags) versions.value[dependency] = tags;
    });
    await Promise.all(fetchPromises);
    lastUpdate.value = dayjs().toISOString();
  }

  function updateCheck() {
    const isUpdateNeeded = isEmpty.value || !lastUpdate.value || dayjs().diff(lastUpdate.value, "hours") >= 1;
    if (isUpdateNeeded) return updateVersions();
  }
  whenever(() => storage.value.lastUpdate, updateCheck, { immediate: true });

  return {
    versions,
    updateVersions
  };
});

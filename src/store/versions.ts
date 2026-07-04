import { computed } from "vue";
import { createGlobalState, useLocalStorage, whenever } from "@vueuse/core";
import dayjs from "dayjs";
import { getVersionsBatch, type PackageManifest } from "fast-npm-meta";
import { compare } from "semver";
import { useDependencyTable } from "@/composable/useDependencyTable";

interface LatestVersionsStore {
  lastUpdate: string
  data: Record<string, PackageManifest["distTags"]>
}
const DEFAULT_STORE: LatestVersionsStore = {
  lastUpdate: dayjs().toISOString(),
  data: {}
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

  async function updateVersions(): Promise<void> {
    const { dependencies } = useDependencyTable();
    const manifests = await getVersionsBatch(dependencies.value);
    for (const { name, distTags: tags } of manifests) {
      // Ignore next version if it's lower or equal to latest
      if (tags.next && compare(tags.next, tags.latest) <= 0) delete tags.next;
      versions.value[name] = { latest: tags.latest, next: tags.next };
    }

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

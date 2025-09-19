<template>
  <section class="import-export">
    <button title="export repositories" type="button" @click="exportSettings">
      <icon-download />
      Export settings
    </button>
    <button title="import repositories" type="button" @click="importFile()">
      <icon-upload v-if="!isImporting" />
      <icon-loader v-else :model-value="true" />
      Import settings
    </button>
  </section>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useFileDialog, whenever } from "@vueuse/core";
import { IconDownload, IconUpload } from "@tabler/icons-vue";
import dayjs from "dayjs";
import { isExportedData, type ExportedData } from "@/helpers/export";
import { downloadFile, readFile } from "@/helpers/file";
import { isValidJSON } from "@/helpers/validate";
import { useExcludedDependenciesStore } from "@/store/excluded-dependencies";
import { useRepositoriesStore } from "@/store/repositories";
import { useSettingsStore } from "@/store/settings";
import IconLoader from "./icon-loader.vue";

const { importRepositories, exportRepositories } = useRepositoriesStore();
const { settings, importSettings } = useSettingsStore();
const { excludedDependencies, importExcludedDependencies } = useExcludedDependenciesStore();

// Import
const isImporting = ref<boolean>(false);
const { files, open: importFile } = useFileDialog({ multiple: false, reset: true, accept: "application/json" });
whenever(files, async ({ 0: payload }) => {
  try {
    isImporting.value = true;

    const content = await readFile(payload).then(String);
    if (!isValidJSON(content)) throw new Error("Invalid JSON");
    const parsedData = JSON.parse(content);
    if (!isExportedData(parsedData)) throw new Error("Invalid import data");

    importSettings(parsedData.settings);
    if (parsedData.excludedDependencies.length) { importExcludedDependencies(parsedData.excludedDependencies); }
    if (parsedData.repositories.length) { await importRepositories(parsedData.repositories); }
  } finally {
    isImporting.value = false;
  }
});

// Export
function exportSettings(): void {
  const fileName = `github-metrics-${dayjs().format("YYYY-MM-DD")}`;
  const payload: ExportedData = {
    settings: settings.value,
    excludedDependencies: [...excludedDependencies.value.values()],
    repositories: exportRepositories()
  };
  downloadFile(JSON.stringify(payload), fileName, "application/json");
}
</script>
<style lang="scss">
.import-export {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  @media (width <= 600px) {
    grid-template-columns: 1fr;
  }
}
</style>

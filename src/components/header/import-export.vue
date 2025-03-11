<template>
  <button title="export repositories" type="button" :disabled="noData" @click="exportFile">
    <icon-download />
    Export
  </button>
  <button title="import repositories" type="button" @click="importFile()">
    <icon-upload v-if="!isImporting" />
    <icon-loader v-else :model-value="true" />
    Import
  </button>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useFileDialog, whenever } from "@vueuse/core";
import { IconDownload, IconUpload } from "@tabler/icons-vue";
import dayjs from "dayjs";
import { downloadFile, readFile } from "@/helpers/file";
import { isValidJSON } from "@/helpers/validate";
import { isExportedRepository, useRepositoriesStore, type ExportedRepository } from "@/store/repositories";
import IconLoader from "../icon-loader.vue";

defineProps<{ noData: boolean }>();
const { files, open: importFile } = useFileDialog({ multiple: false, reset: true, accept: "application/json" });

const { importRepositories, exportRepositories } = useRepositoriesStore();

const isImporting = ref<boolean>(false);
whenever(files, async ({ 0: payload }) => {
  const content = await readFile(payload).then(String);
  if (!isValidJSON(content)) throw new Error("Invalid JSON");

  const parsedData = JSON.parse(content);
  if (!Array.isArray(parsedData)) throw new Error("Invalid import data");
  const importData = parsedData.reduce((acc: ExportedRepository[], repo) => {
    if (isExportedRepository(repo)) acc.push(repo);
    return acc;
  }, []);
  if (!importData.length) throw new Error("Invalid import data");

  try {
    isImporting.value = true;
    await importRepositories(importData);
  } finally {
    isImporting.value = false;
  }
});

function exportFile(): void {
  const suggestedName = `github-metrics-${dayjs().format("YYYY-MM-DD")}.json`;
  downloadFile(exportRepositories(), suggestedName, "application/json");
}
</script>

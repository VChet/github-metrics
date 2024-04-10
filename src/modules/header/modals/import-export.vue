<template>
  <button title="export repositories" type="button" :disabled="noData" @click="exportFile">
    <icon-file-download />
    Export
  </button>
  <button title="import repositories" type="button" @click="importFile()">
    <icon-file-upload />
    Import
  </button>
</template>
<script setup lang="ts">
import { onUnmounted } from "vue";
import { useFileDialog, whenever } from "@vueuse/core";
import { IconFileDownload, IconFileUpload } from "@tabler/icons-vue";
import dayjs from "dayjs";
import { downloadFile, readFile } from "@/helpers/file";
import { useRepositoriesStore } from "@/store/repositories";

defineProps<{ noData: boolean }>();
const { files, open: importFile, reset } = useFileDialog({ multiple: false, accept: "application/json" });
onUnmounted(reset);

const { exportRepositories, importRepositories } = useRepositoriesStore();

whenever(files, async (payload) => {
  const content = await readFile(payload[0]);
  if (content) {
    const data = JSON.parse(String(content));
    if (!data) throw new Error("Invalid JSON");
    importRepositories(data);
    reset();
  }
});

function exportFile() {
  const name = `github-metrics-${dayjs().format("YYYY-MM-DD")}.json`;
  downloadFile(exportRepositories(), name, "application/json");
}
</script>

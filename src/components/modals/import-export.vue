<template>
  <button title="export repositories" type="button" @click="exportFile">
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
import { whenever, useFileDialog } from "@vueuse/core";
import { IconFileDownload, IconFileUpload } from "@tabler/icons-vue";
import { downloadFile, readFile } from "@/service/file";
import { importRepositories, exportRepositories } from "@/store/repositories";

const { files, open: importFile, reset } = useFileDialog({ multiple: false, accept: "application/json" });

onUnmounted(reset);

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
  downloadFile(exportRepositories(), "repositories.json", "application/json");
}
</script>

<template>
  <button title="open settings" type="button" @click="open">
    <icon-arrows-up-down />
    Import / Export
  </button>
  <dialog ref="dialogRef">
    <header>Import / Export</header>
    <form class="import-export-form" @submit.prevent>
      <button title="import" type="button" @click="importFile()">Import</button>
      <button title="export" type="button" @click="exportFile()">Export</button>
    </form>
  </dialog>
</template>
<script setup lang="ts">
import { onUnmounted } from "vue";
import { whenever, useFileDialog } from "@vueuse/core";
import { IconArrowsUpDown } from "@tabler/icons-vue";
import { useDialog } from "@/service/modal";
import { downloadFile, readFile } from "@/service/file";
import { importRepositories, exportRepositories } from "@/store/repositories";

const { element: dialogRef, open, close } = useDialog();

const { files, open: importFile, reset } = useFileDialog({ multiple: false, accept: "application/json" });

onUnmounted(reset);

whenever(files, async (payload) => {
  const content = await readFile(payload[0]);
  if (content) {
    const data = JSON.parse(content.toString());
    if (!data) throw new Error("Invalid JSON");
    importRepositories(data);
    close();
  }
});

function exportFile() {
  downloadFile(exportRepositories(), "repositories.json", "application/json");
  close();
}
</script>
<style lang="scss">
.import-export-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

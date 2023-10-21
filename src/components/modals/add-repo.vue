<template>
  <button title="add repo" type="button" @click="open">
    <icon-plus />
    Add GitHub repo
  </button>
  <dialog ref="dialogRef" :class="{ invalid: hasError }">
    <header>Add GitHub repo</header>
    <repo-form :repo="form" submit-text="Add" @submit="addRepo" />
  </dialog>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { IconPlus } from "@tabler/icons-vue";
import RepoForm from "@/components/repo-form.vue";
import { addRepository } from "@/store/repositories";
import { useDialog } from "@/service/modal";
import { Repository } from "@/composable/Repo";

const { element: dialogRef, open, close } = useDialog();

// Form
const formDefaults = {
  full_name: "",
  integrations: {
    uptimerobotKey: "",
    hostingProjectId: "",
    bundler: "",
    analytics: "",
    tests: ""
  }
} as const;
Object.freeze(formDefaults);

const form = ref(JSON.parse(JSON.stringify(formDefaults)));
function resetForm() {
  Object.assign(form, JSON.parse(JSON.stringify(formDefaults)));
}

const hasError = ref(false);
watch(
  () => form.value.full_name,
  () => {
    hasError.value = false;
  }
);

async function addRepo(payload: Repository) {
  if (!payload.full_name) return;
  try {
    hasError.value = false;
    await addRepository(payload.full_name, payload.integrations);
    resetForm();
    close();
  } catch (error) {
    hasError.value = true;
  }
}
</script>

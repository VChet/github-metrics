<template>
  <button title="edit repo" type="button" class="icon-button" @click="open">
    <icon-pencil title="edit repo" />
  </button>
  <teleport to="body">
    <dialog v-if="form" ref="dialogRef" :class="{ invalid: hasError }">
      <header>Edit &laquo;{{ form.name }}&raquo;</header>
      <repo-form :repo="form" submit-text="Update" @submit="editRepo" />
    </dialog>
  </teleport>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { IconPencil } from "@tabler/icons-vue";
import RepoForm from "@/components/repo-form.vue";
import { updateRepository } from "@/store/repositories";
import { useDialog } from "@/service/modal";
import { Repository } from "@/composable/Repo";

const props = defineProps<{ repo: Pick<Repository, "name" | "full_name" | "integrations"> }>();

const { element: dialogRef, open, close } = useDialog();

// Form

const form = ref(JSON.parse(JSON.stringify(props.repo)));

const hasError = ref<boolean>(false);
watch(
  () => form.value.full_name,
  () => {
    hasError.value = false;
  }
);

async function editRepo(payload: Repository) {
  if (!payload.full_name) return;
  try {
    hasError.value = false;
    await updateRepository(payload.full_name, payload.integrations);
    close();
  } catch (error) {
    hasError.value = true;
  }
}
</script>

<template>
  <button title="edit repo" type="button" class="icon-button" @click="open">
    <icon-pencil title="edit repo" />
  </button>
  <teleport to="body">
    <dialog v-if="form" ref="dialogElement" :class="{ invalid: hasError }">
      <header>
        Edit &laquo;{{ form.name }}&raquo;
        <button type="button" name="close" class="icon" @click="close">
          <icon-x />
        </button>
      </header>
      <repo-form :repo="form" submit-text="Update" @submit="editRepo" />
    </dialog>
  </teleport>
</template>
<script setup lang="ts">
import { ref, useTemplateRef, watch } from "vue";
import { IconPencil, IconX } from "@tabler/icons-vue";
import { useDialog } from "@/composable/useDialog";
import { deepCopy } from "@/helpers/object";
import { useRepositoriesStore } from "@/store/repositories";
import type { Repository } from "@/composable/useRepo";
import RepoForm from "../header/repo-form.vue";

interface Props {
  repo: Pick<Repository, "name" | "full_name" | "integrations">
}
const props = defineProps<Props>();

const dialogRef = useTemplateRef("dialogElement");
const { open, close } = useDialog(dialogRef);

// Form
const form = ref(deepCopy(props.repo));

const hasError = ref<boolean>(false);
watch(() => form.value.full_name, () => {
  hasError.value = false;
});

const { updateRepository } = useRepositoriesStore();
async function editRepo({ full_name, integrations }: Pick<Repository, "full_name" | "integrations">): Promise<void> {
  if (!full_name) return;
  try {
    hasError.value = false;
    await updateRepository(full_name, integrations);
    close();
  } catch {
    hasError.value = true;
  }
}
</script>

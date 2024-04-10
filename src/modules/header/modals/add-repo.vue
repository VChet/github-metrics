<template>
  <button title="add repo" type="button" @click="open">
    <icon-plus />
    Add GitHub repo
  </button>
  <teleport to="body">
    <dialog ref="dialogRef" class="add-repo" :class="{ invalid: hasError }">
      <header>
        Add GitHub repo
        <button type="button" name="close" class="icon" @click="close">
          <icon-x />
        </button>
      </header>
      <div v-if="settings.authToken" class="add-repo__tabs">
        <button :class="{ active: tab === 'url' }" @click="tab = 'url'">
          via URL
        </button>
        <button :class="{ active: tab === 'token' }" @click="tab = 'token'">
          via current user
        </button>
      </div>
      <repo-form v-if="tab === 'url'" :repo="form" submit-text="Add" @submit="addRepo" />
      <user-repos v-else-if="tab === 'token'" :progress="progress" @submit="addRepos" />
    </dialog>
  </teleport>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { IconPlus, IconX } from "@tabler/icons-vue";
import RepoForm from "@/modules/header/repo-form.vue";
import UserRepos from "@/modules/header/user-repos.vue";
import { useRepositoriesStore } from "@/store/repositories";
import { useSettingsStore } from "@/store/settings";
import { useDialog } from "@/composable/useDialog";
import { deepCopy } from "@/helpers/object";
import type { Repository } from "@/composable/useRepo";

const { settings } = useSettingsStore();
const { element: dialogRef, open, close } = useDialog();

// Form
const tab = ref<"url" | "token">("url");
const progress = reactive({ current: 0, total: 0 });
const formDefaults = { full_name: "", name: "", integrations: {} } as const;
Object.freeze(formDefaults);

const form = ref(deepCopy(formDefaults));
function resetForm() {
  Object.assign(form, deepCopy(formDefaults));
  tab.value = "url";
  progress.current = 0;
  progress.total = 0;
}

const hasError = ref(false);
watch(() => form.value.full_name, () => {
  hasError.value = false;
});

const { addRepository } = useRepositoriesStore();

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
async function addRepos(payload: Repository[]) {
  if (!payload.length) return;

  try {
    hasError.value = false;
    progress.total = payload.length;
    for (const repo of payload) {
      if (!repo.full_name) return;
      await addRepository(repo.full_name, {});
      progress.current += 1;
    }
    resetForm();
    close();
  } catch (error) {
    hasError.value = true;
  }
}
</script>
<style lang="scss">
.add-repo {
  &__tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    button {
      &.active {
        color: var(--accent);
        border-color: var(--accent);
      }
    }
  }
}
</style>

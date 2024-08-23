<template>
  <button v-bind="$attrs" title="add repo" type="button" @click="open">
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
      <user-repos v-else-if="tab === 'token'" :progress @submit="addRepos" />
    </dialog>
  </teleport>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { IconPlus, IconX } from "@tabler/icons-vue";
import { useRepositoriesStore } from "@/store/repositories";
import { useSettingsStore } from "@/store/settings";
import { useDialog } from "@/composable/useDialog";
import { deepCopy } from "@/helpers/object";
import type { Repository } from "@/composable/useRepo";
import UserRepos from "../header/user-repos.vue";
import RepoForm from "../header/repo-form.vue";

defineOptions({ inheritAttrs: false });

const { settings } = useSettingsStore();
const { element: dialogRef, open, close } = useDialog();

// Form
const tab = ref<"url" | "token">("url");
const progress = reactive({ current: 0, total: 0 });
const DEFAULTS = { full_name: "", name: "", integrations: {} } as const;
Object.freeze(DEFAULTS);

const form = ref(deepCopy(DEFAULTS));
function resetForm(): void {
  form.value.full_name = "";
  form.value.name = "";
  form.value.integrations = {};
  tab.value = "url";
  progress.current = 0;
  progress.total = 0;
}

const hasError = ref(false);
watch(() => form.value.full_name, () => {
  hasError.value = false;
});

const { addRepository } = useRepositoriesStore();

async function addRepo({ full_name, integrations }: Pick<Repository, "full_name" | "integrations">): Promise<void> {
  if (!full_name) return;
  try {
    hasError.value = false;
    await addRepository(full_name, integrations);
    resetForm();
    close();
  } catch (error) {
    hasError.value = true;
  }
}
async function addRepos(payload: Repository[]): Promise<void> {
  if (!payload.length) return;

  try {
    hasError.value = false;
    progress.total = payload.length;

    const fetchPromises = payload
      .map(({ full_name }) => full_name ? addRepository(full_name).then(() => { progress.current += 1; }) : null)
      .filter(Boolean);
    await Promise.all(fetchPromises);
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

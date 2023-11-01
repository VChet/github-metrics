<template>
  <button title="add repo" type="button" @click="open">
    <icon-plus />
    Add GitHub repo
  </button>
  <dialog ref="dialogRef" class="add-repo" :class="{ invalid: hasError }">
    <header>Add GitHub repo</header>
    <div v-if="settings.authToken" class="add-repo__tabs">
      <button :class="{ active: tab === 'url' }" @click="tab = 'url'">via URL</button>
      <button :class="{ active: tab === 'token' }" @click="tab = 'token'">via current user</button>
    </div>
    <repo-form v-if="tab === 'url'" :repo="form" submit-text="Add" @submit="addRepo" />
    <user-repos v-else-if="tab === 'token'" @submit="addRepos" />
  </dialog>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { IconPlus } from "@tabler/icons-vue";
import RepoForm from "@/components/repo-form.vue";
import UserRepos from "@/components/user-repos.vue";
import { addRepository } from "@/store/repositories";
import { settings } from "@/store/settings";
import { useDialog } from "@/service/modal";
import { Repository } from "@/composable/Repo";

const { element: dialogRef, open, close } = useDialog();

const tab = ref<"url" | "token">("url");

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
  tab.value = "url";
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
async function addRepos(payload: Repository[]) {
  if (!payload.length) return;
  try {
    hasError.value = false;
    for (const repo of payload) {
      if (!repo.full_name) return;
      await addRepository(repo.full_name, {});
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
  max-width: 450px;
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

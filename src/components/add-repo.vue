<template>
  <fieldset :class="classList">
    <legend>Add new GitHub repo</legend>
    <form class="add-repo__form" @submit.prevent="addRepo">
      <input v-model="repoFullName" placeholder="owner/name" />
      <button type="submit" :disabled="!repoFullName">Submit</button>
    </form>
  </fieldset>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storage } from "@/store/repositories";
import { Repository } from "@/classes/Repo";

const repoFullName = ref("");

const hasError = ref(false);
watch(repoFullName, () => {
  hasError.value = false;
});
async function addRepo() {
  try {
    hasError.value = false;
    const repo = await Repository.init(repoFullName.value);
    if (repo) {
      const isAlreadyStored = storage.value.repositories.some(({ id }) => id === repo.id);
      if (!isAlreadyStored) storage.value.repositories.push(repo);
    }
  } catch (error) {
    hasError.value = true;
  }
}

const classList = computed(() => {
  const key = "add-repo";
  return {
    [key]: true,
    error: hasError.value
  };
});
</script>
<style lang="scss">
.add-repo {
  &__form {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    input {
      flex: 1;
    }
    button {
      padding: 0.5rem;
      border: 1px solid var(--base);
      border-radius: var(--radius);
      &:hover,
      &:focus-visible {
        color: var(--accent);
        border-color: var(--accent);
      }
      &:disabled {
        border-color: var(--base-dimmed);
      }
    }
  }
}
</style>

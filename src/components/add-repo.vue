<template>
  <fieldset :class="classList">
    <legend>Add new GitHub repo</legend>
    <form class="add-repo__form" @submit.prevent="addRepo">
      <input v-model.trim="form.repoFullName" required placeholder="owner/name *" />
      <button title="add repo" type="submit">Submit</button>
      <details>
        <summary>Additional</summary>
        <div class="add-repo__form">
          <input v-model.trim="form.monitorKey" placeholder="uptimerobot monitor key" />
          <input v-model.trim="form.projectId" placeholder="hosting project id" />
          <input-select v-model="form.bundler" :items="bundlerOptions" label="bundler:" />
          <input-select v-model="form.analytics" :items="analyticsOptions" label="analytics:" />
          <input-select v-model="form.tests" :items="testsOptions" label="tests:" />
        </div>
      </details>
    </form>
  </fieldset>
</template>
<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import InputSelect from "@/components/input-select.vue";
import { storage } from "@/store/repositories";
import { Repository } from "@/classes/Repo";

const formDefaults = {
  repoFullName: "",
  monitorKey: "",
  projectId: "",
  bundler: "",
  analytics: "",
  tests: ""
} as const;
Object.freeze(formDefaults);

const bundlerOptions = [{ name: "Vite", value: "vite" }] as const;
const analyticsOptions = [{ name: "counter.dev", value: "counter.dev" }] as const;
const testsOptions = [
  { name: "mocha", value: "mocha" },
  { name: "jest", value: "jest" },
  { name: "vitest", value: "vitest" }
] as const;

const form = reactive({ ...formDefaults });
const integrations = computed(() => ({
  monitorKey: form.monitorKey,
  projectId: form.projectId,
  bundler: form.bundler,
  analytics: form.analytics,
  tests: form.tests
}));
function resetForm() {
  Object.assign(form, { ...formDefaults });
}

const hasError = ref(false);
watch(
  () => form.repoFullName,
  () => {
    hasError.value = false;
  }
);
async function addRepo() {
  try {
    hasError.value = false;
    const repo = await Repository.init(form.repoFullName, integrations.value);
    if (repo) {
      const isNew = storage.value.repositories.every(({ id }) => id !== repo.id);
      if (isNew) storage.value.repositories.push(repo);
    }
    resetForm();
  } catch (error) {
    hasError.value = true;
  }
}

const classList = computed(() => {
  const key = "add-repo";
  return {
    [key]: true,
    [`${key}--invalid`]: hasError.value
  };
});
</script>
<style lang="scss">
.add-repo {
  &--invalid {
    border-color: #a10000;
    legend {
      color: #a10000;
    }
  }
  &__form {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    details {
      grid-column: 1 / -1;
      .add-repo__form {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        margin: 1rem 0;
      }
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

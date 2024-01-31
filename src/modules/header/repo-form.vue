<template>
  <form class="repo-form" @submit.prevent="$emit('submit', form)">
    <input v-model.trim="form.full_name" name="fullName" required placeholder="owner/name *">
    <fieldset class="repo-form">
      <legend>Integrations</legend>
      <input v-model.trim="form.integrations.uptimerobotKey" name="uptimerobotKey" placeholder="uptimerobot monitor key">
      <input v-model.trim="form.integrations.hostingProjectId" name="hostingProjectId" placeholder="netlify project id">
      <input-select v-model="form.integrations.analytics" :items="analyticsOptions" name="analytics" label="analytics:" />
    </fieldset>
    <button title="add repo" type="submit">
      {{ submitText }}
    </button>
  </form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import InputSelect from "@/components/input-select.vue";
import type { Repository } from "@/composable/useRepo";

const props = defineProps<{ repo: Pick<Repository, "full_name" | "integrations">, submitText: string }>();
defineEmits(["submit"]);
// Form
const analyticsOptions = [{ name: "counter.dev", value: "counter.dev" }] as const;

const form = ref(JSON.parse(JSON.stringify(props.repo)));
</script>
<style lang="scss">
.repo-form {
  display: grid;
  gap: 1rem;
}
</style>

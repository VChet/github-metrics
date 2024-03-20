<template>
  <form class="repo-form" @submit.prevent="$emit('submit', form)">
    <input v-model.trim="form.full_name" name="fullName" required placeholder="owner/name *">
    <fieldset>
      <legend>Analytics</legend>
      <input-select v-model="form.integrations.analytics" :items="analyticsOptions" name="analytics" />
    </fieldset>
    <fieldset>
      <legend>UptimeRobot Status</legend>
      <ol v-if="!form.integrations.uptimerobotKey">
        <li>
          Go to
          <a href="https://uptimerobot.com/dashboard.php#mySettings" target="_blank">
            Settings
          </a>
        </li>
        <li>Find "Monitor-Specific API Keys"</li>
        <li>Find your monitor</li>
        <li>Copy and paste it's API key here</li>
      </ol>
      <input v-model.trim="form.integrations.uptimerobotKey" name="uptimerobotKey" placeholder="uptimerobot monitor key">
    </fieldset>
    <fieldset>
      <legend>Netlify Deploy Status</legend>
      <ol v-if="form.name && !form.integrations.hostingProjectId">
        <li>
          Go to
          <a
            :href="`https://app.netlify.com/sites/${form.name}/configuration/general#site-information`"
            :disabled="!form.name"
            target="_blank"
          >
            Site Details
          </a>
        </li>
        <li>Find "Site ID" line</li>
        <li>Copy and paste it here</li>
      </ol>
      <input v-model.trim="form.integrations.hostingProjectId" name="hostingProjectId" placeholder="project id">
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
const analyticsOptions = [
  { name: "counter.dev", value: "counter.dev" },
  { name: "Google Analytics", value: "google_analytics" },
  { name: "Yandex.Metrika", value: "yandex_metrika" },
  { name: "Hotjar", value: "hotjar" },
  { name: "Umami", value: "umami" }
] as const;

const form = ref(JSON.parse(JSON.stringify(props.repo)));
</script>
<style lang="scss">
.repo-form {
  display: grid;
  gap: 1rem;
}
</style>

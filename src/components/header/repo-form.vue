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
    <fieldset v-if="form.name">
      <legend>Netlify Deploy Status</legend>
      <ol v-if="!form.integrations.hostingProjectId">
        <li>
          Go to
          <a
            :href="`https://app.netlify.com/sites/${form.name}/configuration/general#site-information`"
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
import { deepCopy } from "@/helpers/object";
import type { Repository } from "@/composable/useRepo";
import InputSelect from "@/components/input-select.vue";

interface Props {
  repo: Pick<Repository, "name" | "full_name" | "integrations">
  submitText: string
}
const props = defineProps<Props>();
defineEmits<{ submit: [repo: Pick<Repository, "full_name" | "integrations">] }>();
// Form
const analyticsOptions = [
  { name: "Ackee", value: "ackee" },
  { name: "GoatCounter", value: "goat_counter" },
  { name: "Matomo", value: "matomo" },
  { name: "Plausible", value: "plausible" },
  { name: "PostHog", value: "posthog" },
  { name: "counter.dev", value: "counter.dev" },
  { name: "Google Analytics", value: "google_analytics" },
  { name: "Hotjar", value: "hotjar" },
  { name: "Umami", value: "umami" },
  { name: "Yandex.Metrika", value: "yandex_metrika" }
] as const;

const form = ref(deepCopy(props.repo));
</script>
<style lang="scss">
.repo-form {
  display: grid;
  gap: 1rem;
}
</style>

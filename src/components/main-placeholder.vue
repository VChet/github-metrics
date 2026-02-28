<template>
  <div class="main-placeholder">
    <header class="main-placeholder__header">
      No repositories added yet
    </header>
    To add a repository, use the <b>Add GitHub repo</b> button and enter its owner and name.
    <div v-if="!settings.authToken" class="main-placeholder__token-note">
      <header>
        No GitHub API token
      </header>
      Without a token you only have 50 requests per hour.
      <p>
        Go to <b>Settings</b> and paste your token there — it takes <i>less than a minute</i> and will greatly simplify working with the service.
      </p>
      <p>
        Once added, you can selectively choose which repositories to track and enjoy the full 5000 requests/hour limit, and get access to your private repositories.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSettingsStore } from "@/store/settings";

const { settings } = useSettingsStore();
</script>
<style lang="scss">
.main-placeholder {
  font-size: 1.25rem;
  line-height: 1.3;
  header {
    margin-bottom: 1rem;
    font-weight: bold;
  }
  p {
    margin-block: 0.5rem;
  }
  &__token-note {
    margin-block: 2rem;
  }
}
</style>

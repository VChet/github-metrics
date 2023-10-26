<template>
  <header class="main-header">
    <div>
      <header-summary />
      <button title="get rate limit" type="button" @click="fetchRateLimit">
        Rate Limit
        <icon-activity-heartbeat />
        {{ rateLimit }}
      </button>
      <settings-modal />
    </div>
    <div>
      <button title="update repositories" type="button" @click="updateRepositories">
        <icon-refresh />
        Update Repos
      </button>
      <import-export />
      <add-repo />
    </div>
  </header>
</template>

<script setup lang="ts">
import { IconActivityHeartbeat, IconRefresh } from "@tabler/icons-vue";
import HeaderSummary from "@/components/header-summary.vue";
import SettingsModal from "@/components/modals/settings-modal.vue";
import ImportExport from "@/components/modals/import-export.vue";
import AddRepo from "@/components/modals/add-repo.vue";
import { fetchRateLimit, rateLimit } from "@/service/octokit";
import { updateRepositories } from "@/store/repositories";
</script>

<style lang="scss">
.main-header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
  justify-content: space-between;
  > div {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
}
</style>

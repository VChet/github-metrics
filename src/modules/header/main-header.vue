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
      <about-modal />
    </div>
    <div>
      <button title="update" type="button" :disabled="noData" @click="update">
        <icon-refresh />
        Update
      </button>
      <import-export :no-data="noData" />
      <add-repo />
    </div>
  </header>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { IconActivityHeartbeat, IconRefresh } from "@tabler/icons-vue";
import AboutModal from "./modals/about-modal.vue";
import HeaderSummary from "@/modules/header/header-summary.vue";
import SettingsModal from "@/modules/header/modals/settings-modal.vue";
import ImportExport from "@/modules/header/modals/import-export.vue";
import AddRepo from "@/modules/header/modals/add-repo.vue";
import { fetchRateLimit, rateLimit } from "@/service/octokit";
import { useRepositoriesStore } from "@/store/repositories";
import { useEventsStore } from "@/store/events";

const { storage, updateRepositories } = useRepositoriesStore();

const noData = computed(() => !storage.value.repositories.length);

const { fetch: updateEvents } = useEventsStore();
async function update() {
  await Promise.all([updateRepositories(), updateEvents()]);
}
</script>
<style lang="scss">
.main-header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  > div {
    display: flex;
    flex-wrap: wrap;
    gap: inherit;
    align-items: center;
    > * {
      @media (width <= 600px) {
        flex: 1;
      }
    }
  }
}
</style>

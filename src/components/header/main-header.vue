<template>
  <header class="main-header">
    <div>
      <header-summary />
      <settings-modal />
      <about-modal />
      <button title="get rate limit" type="button" @click="fetchRateLimit">
        Rate Limit
        <icon-activity-heartbeat />
        {{ rateLimit }}
      </button>
      <button class="main-header__block-button" title="update" type="button" :disabled="isEmpty" @click="update">
        <icon-loader v-model="isUpdating" />
        Update
      </button>
    </div>
    <div>
      <import-export :no-data="isEmpty" />
      <add-repo class="main-header__block-button" />
    </div>
  </header>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { IconActivityHeartbeat } from "@tabler/icons-vue";
import { fetchRateLimit, rateLimit } from "@/service/octokit";
import { useRepositoriesStore } from "@/store/repositories";
import { useEventsStore } from "@/store/events";
import { useLatestVersionsStore } from "@/store/latest-versions";
import { clearCachedRequests } from "@/service/memoize";
import HeaderSummary from "./header-summary.vue";
import ImportExport from "./import-export.vue";
import AboutModal from "../modals/about-modal.vue";
import AddRepo from "../modals/add-repo.vue";
import SettingsModal from "../modals/settings-modal.vue";
import IconLoader from "../icon-loader.vue";

const { isEmpty, updateRepositories } = useRepositoriesStore();
const { updateLatestVersions } = useLatestVersionsStore();
const { updateEvents } = useEventsStore();

const isUpdating = ref<boolean>(false);
async function update(): Promise<void> {
  try {
    isUpdating.value = true;
    clearCachedRequests();
    await Promise.all([updateRepositories(), updateLatestVersions(), updateEvents()]);
  } finally {
    isUpdating.value = false;
  }
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
    @media (width <= 600px) {
    flex-basis: 100%;
      > * {
        flex-grow: 1;
      }
    }
  }
  &__block-button {
    @media (width <= 600px) {
      flex-basis: 100%;
    }
  }
}
</style>

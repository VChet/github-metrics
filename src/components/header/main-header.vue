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
      <button class="main-header__block-button" title="update" type="button" :disabled="noData" @click="update">
        <icon-refresh ref="refreshIcon" />
        Update
      </button>
    </div>
    <div>
      <import-export :no-data />
      <add-repo class="main-header__block-button" />
    </div>
  </header>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useAnimate } from "@vueuse/core";
import { IconActivityHeartbeat, IconRefresh } from "@tabler/icons-vue";
import { fetchRateLimit, rateLimit } from "@/service/octokit";
import { useRepositoriesStore } from "@/store/repositories";
import { useEventsStore } from "@/store/events";
import HeaderSummary from "./header-summary.vue";
import ImportExport from "./import-export.vue";
import AboutModal from "../modals/about-modal.vue";
import AddRepo from "../modals/add-repo.vue";
import SettingsModal from "../modals/settings-modal.vue";

const { storage, updateRepositories } = useRepositoriesStore();
const noData = computed(() => !storage.value.repositories.length);

const { fetch: updateEvents } = useEventsStore();

const refreshIcon = ref<SVGElement>();
const { play, finish } = useAnimate(refreshIcon, { transform: "rotate(360deg)" }, 1000);
async function update(): Promise<void> {
  if (!refreshIcon.value) return;
  refreshIcon.value.style.setProperty("will-change", "transform");
  play();
  await Promise.all([updateRepositories(), updateEvents()]).finally(() => {
    finish();
    refreshIcon.value!.style.removeProperty("will-change");
  });
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

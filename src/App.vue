<template>
  <main-header class="container" />
  <user-feed v-if="isFeedAvailable" class="container" />
  <div v-if="!storage.repositories.length" class="container repo-grid__placeholder">
    <b>No repositories added yet.</b>
    <p>
      To&nbsp;add a&nbsp;repository manually, use the &laquo;Add GitHub repo&raquo; button above and enter it's owner and name.
    </p>
    <p>
      Alternatively, visit &laquo;Settings&raquo; to&nbsp;add your token and then press &laquo;Add GitHub repo&raquo;,
      where you could selectively choose repositories to&nbsp;add.
    </p>
  </div>
  <template v-else>
    <ul class="container tab-selector">
      <li v-for="{ value, text } in tabs" :key="value">
        <button
          class="tab-selector__button"
          :class="{ 'tab-selector__button--active': selectedTab === value }"
          type="button"
          @click="selectedTab = value"
        >
          {{ text }}
        </button>
      </li>
    </ul>
    <repo-grid v-show="selectedTab === 'grid'" class="container" />
    <dependencies-table v-show="selectedTab === 'table'" class="container" />
  </template>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import MainHeader from "@/modules/header/main-header.vue";
import UserFeed from "@/modules/feed/user-feed.vue";
import RepoGrid from "@/modules/grid/repo-grid.vue";
import DependenciesTable from "@/modules/dependencies/dependencies-table.vue";
import { useSettingsStore } from "@/store/settings";
import { useRepositoriesStore } from "@/store/repositories";

const { storage } = useRepositoriesStore();
const { settings } = useSettingsStore();
const isFeedAvailable = computed<boolean>(() => !!settings.value.authToken && !!settings.value.username);

const tabs = [
  { value: "grid", text: "Repositories" },
  { value: "table", text: "Dependencies" }
];
const selectedTab = ref(tabs[0].value);
</script>
<style lang="scss">
.tab-selector {
  display: flex;
  gap: .5rem;
  align-items: center;
  &__button {
    &--active {
      color: var(--accent);
      border-color: var(--accent);
    }
  }
}
</style>

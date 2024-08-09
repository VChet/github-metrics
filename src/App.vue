<template>
  <main class="container main-container">
    <main-header />
    <main-placeholder v-if="!storage.repositories.length" />
    <template v-else>
      <tab-selector v-model="selectedTab" :items="tabs" />
      <repo-grid v-show="selectedTab === 'grid'" />
      <dependencies-table v-show="selectedTab === 'table'" />
      <user-feed v-if="isFeedAvailable" v-show="selectedTab === 'feed'" />
    </template>
  </main>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useSettingsStore } from "@/store/settings";
import { useRepositoriesStore } from "@/store/repositories";
import { useEventsStore } from "@/store/events";
import DependenciesTable from "@/modules/dependencies/dependencies-table.vue";
import MainHeader from "@/modules/header/main-header.vue";
import MainPlaceholder from "@/modules/main-placeholder.vue";
import RepoGrid from "@/modules/grid/repo-grid.vue";
import TabSelector from "@/modules/tab-selector.vue";
import UserFeed from "@/modules/feed/user-feed.vue";

const { storage } = useRepositoriesStore();
const { settings } = useSettingsStore();
const isFeedAvailable = computed<boolean>(() => !!settings.value.authToken && !!settings.value.username);
const { items: feedItems } = useEventsStore();

const tabs = computed(() => {
  const entries: { value: string, text: string, badge?: boolean }[] = [
    { value: "grid", text: "Repositories" },
    { value: "table", text: "Dependencies" }
  ];
  if (isFeedAvailable.value) entries.push({ value: "feed", text: "User Feed", badge: !!feedItems.value.length });
  return entries;
});
const selectedTab = ref(tabs.value[0].value);
</script>
<style lang="scss">
.main-container {
  display: grid;
  gap: 1.5rem;
}
</style>

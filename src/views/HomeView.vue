<template>
  <main class="container main-container">
    <main-header />
    <main-placeholder v-if="!repositories.length" />
    <template v-else>
      <tab-selector v-model="selectedTab" :items="tabs" />
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </template>
  </main>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useEventsStore } from "@/store/events";
import { useRepositoriesStore } from "@/store/repositories";
import MainHeader from "@/components/header/main-header.vue";
import MainPlaceholder from "@/components/main-placeholder.vue";
import TabSelector from "@/components/tab-selector.vue";

type Tab = "Repositories" | "Dependencies" | "Feed";

const router = useRouter();
const pages = computed(() => router.currentRoute.value.matched[0].children.map(({ name }) => name));
const isTabRoute = (name: string): name is Tab => pages.value.includes(name);

const { repositories } = useRepositoriesStore();
const { isFeedAvailable, amount } = useEventsStore();

const tabs = computed(() => {
  const entries: { value: Tab, text: string }[] = [
    { value: "Repositories", text: "Repositories" },
    { value: "Dependencies", text: "Dependencies" }
  ];
  if (isFeedAvailable.value) entries.push({ value: "Feed", text: `Feed (${amount.value})` });
  return entries;
});

const selectedTab = computed<Tab>({
  get: () => {
    const name = router.currentRoute.value.name!.toString();
    return isTabRoute(name) ? name : tabs.value[0].value;
  },
  set: (name) => { router.push({ name }); }
});
</script>
<style lang="scss">
.main-container {
  display: grid;
  gap: 1.5rem;
}
</style>

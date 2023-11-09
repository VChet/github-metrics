<template>
  <section class="repo-grid">
    <div v-if="!items.length" class="repo-grid__placeholder">No repos</div>
    <template v-else>
      <div class="repo-grid__filters">
        <input v-model.trim="searchQuery" placeholder="Search by name..." />
      </div>
      <ul ref="reposRef" class="repo-grid__list">
        <repo-item v-for="repo in items" :key="repo.id" :repo="repo" @delete="deleteRepository" />
      </ul>
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import dayjs from "dayjs";
import { useSortable } from "@vueuse/integrations/useSortable";
import RepoItem from "@/components/repo-item.vue";
import { storage, updateRepositories, deleteRepository } from "@/store/repositories";

const searchQuery = ref("");
const items = computed(() => {
  if (!searchQuery.value) return storage.value.repositories;
  return storage.value.repositories.filter((repo) => {
    return repo.full_name.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const reposRef = ref<HTMLElement | null>(null);
useSortable(reposRef, storage.value.repositories, { handle: ".repo__header-actions-handler", animate: true });

if (!storage.value.lastUpdate || dayjs().diff(dayjs(storage.value.lastUpdate), "hours") >= 1) {
  updateRepositories();
}
</script>
<style lang="scss">
.repo-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
    gap: 1rem;
  }
}
</style>

<template>
  <section class="repo-grid">
    <div class="repo-grid__filters">
      <input v-model.trim="searchQuery" placeholder="Search by name..." />
    </div>
    <ul ref="reposRef" class="repo-grid__list">
      <repo-item v-for="repo in items" :key="repo.id" :repo="repo" @delete="deleteRepository" />
    </ul>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
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
updateRepositories();
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

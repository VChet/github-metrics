<template>
  <ul ref="reposRef" class="repo-grid">
    <repo-item v-for="repo in storage.repositories" :key="repo.id" :repo="repo" @delete="deleteRepository" />
  </ul>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import RepoItem from "@/components/repo-item.vue";
import { storage, updateRepositories, deleteRepository } from "@/store/repositories";

const reposRef = ref<HTMLElement | null>(null);
useSortable(reposRef, storage.value.repositories, { handle: ".repo__header-actions-handler", animate: true });
updateRepositories();
</script>
<style lang="scss">
.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
</style>

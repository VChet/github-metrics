<template>
  <section class="repo-grid">
    <div v-if="!storage.repositories.length" class="repo-grid__placeholder">
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
      <div class="repo-grid__filters">
        <input v-model.trim="searchQueryInput" placeholder="Search by name...">
      </div>
      <ul ref="reposRef" class="repo-grid__list">
        <repo-item
          v-for="repo in filteredItems"
          :key="repo.id"
          :repo="repo"
          :query="searchQuery"
          @delete="deleteRepository"
        />
      </ul>
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { refDebounced } from "@vueuse/core";
import dayjs from "dayjs";
import { useSortable } from "@vueuse/integrations/useSortable";
import RepoItem from "@/components/repo-item.vue";
import { deleteRepository, storage, updateRepositories } from "@/store/repositories";
import { settings } from "@/store/settings";

const searchQueryInput = ref("");
const searchQuery = refDebounced(searchQueryInput, 300);
const filteredItems = computed(() => {
  if (!searchQuery.value) return storage.value.repositories;
  return storage.value.repositories.filter((repo) => {
    const name = settings.value.showOwner ? repo.full_name : repo.name;
    return name.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const reposRef = ref<HTMLElement | null>(null);
useSortable(reposRef, storage.value.repositories, { handle: ".repo__header-actions-handler", animate: true });

if (!storage.value.lastUpdate || dayjs().diff(dayjs(storage.value.lastUpdate), "hours") >= 1) updateRepositories();
</script>
<style lang="scss">
.repo-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1rem;
  }
}
</style>

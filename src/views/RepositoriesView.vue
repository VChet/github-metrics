<template>
  <section class="repo-grid">
    <div class="repo-grid__filters">
      <input v-model.trim="searchQueryInput" name="searchQuery" placeholder="Search by name...">
      <div class="repo-grid__filters-sort">
        Sort:
        <button class="icon" type="button" title="sort alphabetically" @click="sort('alphabetic')">
          <icon-sort-a-z />
        </button>
        <button class="icon" type="button" title="sort by stars" @click="sort('stars')">
          <icon-star />
        </button>
        <button class="icon" type="button" title="sort by forks" @click="sort('forks')">
          <icon-git-fork />
        </button>
        <button class="icon" type="button" title="sort by language" @click="sort('language')">
          <icon-packages />
        </button>
      </div>
    </div>
    <ul ref="reposRef" class="repo-grid__list">
      <repo-item
        v-for="repo in filteredItems"
        :key="repo.id"
        :repo
        :query="searchQuery"
        @delete="deleteRepository"
      />
    </ul>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { refDebounced } from "@vueuse/core";
import dayjs from "dayjs";
import { useSortable } from "@vueuse/integrations/useSortable";
import { IconGitFork, IconPackages, IconSortAZ, IconStar } from "@tabler/icons-vue";
import { useRepositoriesStore } from "@/store/repositories";
import { useSettingsStore } from "@/store/settings";
import RepoItem from "@/components/repo-item.vue";

const { storage, deleteRepository, updateRepositories } = useRepositoriesStore();
const { settings } = useSettingsStore();

const searchQueryInput = ref("");
const searchQuery = refDebounced(searchQueryInput, 300);
const filteredItems = computed(() => {
  if (!searchQuery.value) return storage.value.repositories;
  return storage.value.repositories.filter((repo) => {
    const name = settings.value.showOwner ? repo.full_name : repo.name;
    return RegExp(searchQuery.value, "i").test(name);
  });
});

const reposRef = ref<HTMLUListElement>();
useSortable(reposRef, storage.value.repositories, { handle: ".repo__header-actions-handler" });

function sort(option: "alphabetic" | "stars" | "forks" | "language"): void {
  storage.value.repositories.sort((a, b) => {
    switch (option) {
      case "alphabetic": return a.name.localeCompare(b.name);
      case "stars": return b.stargazers_count - a.stargazers_count;
      case "forks": return b.forks_count - a.forks_count;
      case "language":
        return (a.language && b.language) ?
          a.language.localeCompare(b.language) :
          a.name.localeCompare(b.name);
      default: return 0;
    }
  });
}

if (!storage.value.lastUpdate || dayjs().diff(dayjs(storage.value.lastUpdate), "hours") >= 1) updateRepositories();
</script>
<style lang="scss">
.repo-grid {
  display: grid;
  gap: 2rem;
  &__filters {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    @media (width <= 600px) {
      grid-template-columns: 1fr;
    }
    &-sort {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
  }
  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1rem;
    @media (width <= 600px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>

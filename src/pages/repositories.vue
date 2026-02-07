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
        <button class="icon" type="button" title="sort by issues" @click="sort('issues')">
          <icon-circle-dot />
        </button>
        <button class="icon" type="button" title="sort by last update" @click="sort('update')">
          <icon-clock />
        </button>
        <button class="icon" type="button" title="sort by language" @click="sort('language')">
          <icon-packages />
        </button>
      </div>
    </div>
    <ul ref="reposElement" class="repo-grid__list">
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
import { computed, ref, useTemplateRef } from "vue";
import { refDebounced } from "@vueuse/core";
import { useSortable } from "@vueuse/integrations/useSortable";
import { IconCircleDot, IconClock, IconGitFork, IconPackages, IconSortAZ, IconStar } from "@tabler/icons-vue";
import dayjs from "dayjs";
import { useRepositoriesStore } from "@/store/repositories";
import { useSettingsStore } from "@/store/settings";
import RepoItem from "@/components/repo-item.vue";

const { settings } = useSettingsStore();
const { repositories, deleteRepository } = useRepositoriesStore();

const searchQueryInput = ref("");
const searchQuery = refDebounced(searchQueryInput, 300);
const filteredItems = computed(() => {
  if (!searchQuery.value) return repositories.value;
  return repositories.value.filter((repo) => {
    const name = settings.value.displayOwner ? repo.full_name : repo.name;
    return new RegExp(searchQuery.value, "i").test(name);
  });
});

const reposRef = useTemplateRef("reposElement");
useSortable(reposRef, repositories, { handle: ".drag-handle" });

type SortOption = "alphabetic" | "stars" | "forks" | "issues" | "update" | "language";
function sort(option: SortOption): void {
  repositories.value.sort((a, b) => {
    switch (option) {
      case "alphabetic": return a.name.localeCompare(b.name);
      case "stars": return b.stargazers_count - a.stargazers_count;
      case "forks": return b.forks_count - a.forks_count;
      case "issues": return b.open_issues_count - a.open_issues_count;
      case "update": return dayjs(b.updated_at).diff(dayjs(a.updated_at));
      case "language":
        return (a.language && b.language) ?
          a.language.localeCompare(b.language) :
          a.name.localeCompare(b.name);
      default: return 0;
    }
  });
}
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
    grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
    gap: 1rem;
    @media (width <= 600px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>

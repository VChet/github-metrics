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
        <input v-model.trim="searchQueryInput" name="searchQuery" placeholder="Search by name...">
        <div class="repo-grid__filters-sort">
          Sort:
          <button class="icon" type="button" @click="sortAZ">
            <icon-sort-a-z />
          </button>
          <button class="icon" type="button" @click="sortByStars">
            <icon-star />
          </button>
        </div>
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
import { IconSortAZ, IconStar } from "@tabler/icons-vue";
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

function sortAZ() {
  storage.value.repositories.sort((a, b) => a.name.localeCompare(b.name));
}
function sortByStars() {
  storage.value.repositories.sort((a, b) => b.stargazers_count - a.stargazers_count);
}

if (!storage.value.lastUpdate || dayjs().diff(dayjs(storage.value.lastUpdate), "hours") >= 1) updateRepositories();
</script>
<style lang="scss">
.repo-grid {
  display: flex;
  flex-direction: column;
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

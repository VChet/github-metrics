<template>
  <form class="user-repos-form" @submit.prevent="$emit('submit', selectedRepos)">
    <fieldset v-if="userRepos.length" class="user-repos-form__filters">
      <legend>Filter out</legend>
      <label v-if="hasPrivate">
        <input v-model="filters.private" name="private" type="checkbox">
        <icon-lock /> private
      </label>
      <label v-if="hasArchived">
        <input v-model="filters.archived" name="archived" type="checkbox">
        <icon-archive /> archived
      </label>
      <label v-if="hasForks">
        <input v-model="filters.forks" name="forks" type="checkbox">
        <icon-git-fork /> forks
      </label>
      <label v-if="hasTemplates">
        <input v-model="filters.templates" name="templates" type="checkbox">
        <icon-template /> templates
      </label>
    </fieldset>
    <div v-if="isLoading" class="user-repos-form__placeholder">
      Loading...
    </div>
    <div v-else-if="!isLoading && !userRepos.length" class="user-repos-form__placeholder">
      No repos
    </div>
    <div v-else-if="!isLoading && !filteredRepos.length" class="user-repos-form__placeholder">
      No repos. Try disabling the filters
    </div>
    <ul v-else class="user-repos-form__list">
      <li v-for="repo in filteredRepos" :key="repo.id">
        <label>
          <input v-model="selectedRepos" name="selectedRepos" type="checkbox" :value="repo">
          <span class="text-truncate">
            <icon-git-fork v-if="repo.fork" />
            <icon-template v-if="repo.is_template" />
            <icon-lock v-if="repo.private" />
            <icon-archive v-if="repo.archived" />
            {{ repo.name }}
          </span>
        </label>
      </li>
    </ul>
    <button v-show="selectedRepos.length" title="add repo" type="submit">
      Add {{ selectedRepos.length }} {{ selectedRepos.length === 1 ? "repo" : "repos" }}
    </button>
  </form>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref } from "vue";
import { IconArchive, IconGitFork, IconLock, IconTemplate } from "@tabler/icons-vue";
import { fetchCurrentUserRepos } from "@/service/octokit";
import { useSettingsStore } from "@/store/settings";
import { useRepositoriesStore } from "@/store/repositories";
import type { UserRepositoriesResponse } from "@/types/repo";
import type { Repository } from "@/composable/useRepo";

defineEmits(["submit"]);

const { storage } = useRepositoriesStore();
const { settings } = useSettingsStore();

const userRepos = ref<UserRepositoriesResponse>([]);
const isLoading = ref(false);
onBeforeMount(async () => {
  if (settings.value.authToken) {
    isLoading.value = true;
    const data = await fetchCurrentUserRepos().finally(() => {
      isLoading.value = false;
    });
    if (data) userRepos.value = data.filter(({ id }) => !storage.value.repositories.some((repo) => repo.id === id));
  }
});

const filters = reactive({
  private: false,
  archived: false,
  forks: false,
  templates: false
});
const hasPrivate = computed(() => userRepos.value.some((repo) => repo.private));
const hasArchived = computed(() => userRepos.value.some((repo) => repo.archived));
const hasForks = computed(() => userRepos.value.some((repo) => repo.fork));
const hasTemplates = computed(() => userRepos.value.some((repo) => repo.is_template));
const filteredRepos = computed(() => {
  let result = userRepos.value;
  if (Object.values(filters).some(Boolean)) {
    if (filters.private) result = result.filter((repo) => !repo.private);
    if (filters.archived) result = result.filter((repo) => !repo.archived);
    if (filters.forks) result = result.filter((repo) => !repo.fork);
    if (filters.templates) result = result.filter((repo) => !repo.is_template);
  }
  return result;
});
const selectedRepos = ref<Repository[]>([]);
</script>
<style lang="scss">
.user-repos-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 50vh;
  overflow: hidden;
  &__placeholder {
    padding: 2rem;
    margin: auto;
    font-size: 1.5rem;
  }
  &__filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  &__list {
    margin: 0;
    overflow: auto;
    li {
      padding: 0.5rem 0;
      label {
        font-size: 1.125rem;
        white-space: nowrap;
      }
    }
  }
}
</style>

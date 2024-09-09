<template>
  <form class="user-repos-form" @submit.prevent="$emit('submit', selectedRepos)">
    <fieldset v-if="userRepos.length" class="user-repos-form__filters">
      <legend>Filters</legend>
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
      <input v-model="filters.searchQuery" placeholder="Search by name">
    </fieldset>
    <div v-if="isLoading" class="user-repos-form__placeholder">
      Loading...
    </div>
    <div v-else-if="!userRepos.length" class="user-repos-form__placeholder">
      No repos
    </div>
    <div v-else-if="!filteredRepos.length" class="user-repos-form__placeholder">
      No repos
      <div>Try enabling the filters</div>
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
    <button v-show="selectedRepos.length" title="add repo" type="submit" :disabled="progress.current < progress.total ">
      <span v-if="progress.total">Adding: {{ progress.current }}/{{ progress.total }}</span>
      <span v-else>
        Add {{ selectedRepos.length }} {{ selectedRepos.length === 1 ? "repo" : "repos" }}
      </span>
    </button>
  </form>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref } from "vue";
import { IconArchive, IconGitFork, IconLock, IconTemplate } from "@tabler/icons-vue";
import { fetchCurrentUserRepos } from "@/service/octokit";
import { useRepositoriesStore } from "@/store/repositories";
import { useSettingsStore } from "@/store/settings";
import type { Repository } from "@/composable/useRepo";
import type { UserRepositoriesResponse } from "@/types/repo";

defineProps<{ progress: { current: number, total: number } }>();
defineEmits<{ submit: [repos: Repository[]] }>();

const { repositories } = useRepositoriesStore();
const { settings } = useSettingsStore();

const userRepos = ref<UserRepositoriesResponse>([]);
const isLoading = ref(false);
onBeforeMount(async () => {
  if (settings.value.authToken) {
    isLoading.value = true;
    const data = await fetchCurrentUserRepos().finally(() => { isLoading.value = false; });
    if (data) userRepos.value = data.filter(({ id }) => !repositories.value.some((repo) => repo.id === id));
  }
});

const filters = reactive({
  searchQuery: "",
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
  if (!filters.private) result = result.filter((repo) => !repo.private);
  if (!filters.archived) result = result.filter((repo) => !repo.archived);
  if (!filters.forks) result = result.filter((repo) => !repo.fork);
  if (!filters.templates) result = result.filter((repo) => !repo.is_template);
  if (!filters.searchQuery) return result;
  return result.filter((repo) => {
    const name = settings.value.showOwner ? repo.full_name : repo.name;
    return new RegExp(filters.searchQuery, "i").test(name);
  });
});
const selectedRepos = ref<Repository[]>([]);
</script>
<style lang="scss">
.user-repos-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 60vh;
  overflow: hidden;
  &__placeholder {
    padding: 2rem;
    margin: auto;
    font-size: 1.5rem;
    text-align: center;
  }
  &__filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    input {
      grid-column: 1 / -1;
    }
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

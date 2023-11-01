<template>
  <form class="user-repos-form" @submit.prevent="$emit('submit', selectedRepos)">
    <ul>
      <li v-for="repo in userRepos" :key="repo.id">
        <label>
          <input v-model="selectedRepos" type="checkbox" :value="repo" />
          <span class="text-truncate">
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
import { ref, onBeforeMount } from "vue";
import { IconArchive, IconLock, IconTemplate } from "@tabler/icons-vue";
import { fetchCurrentUserRepos } from "@/service/octokit";
import { settings } from "@/store/settings";
import type { UserRepositoriesResponse } from "@/types/repo";
import type { Repository } from "@/composable/Repo";

const userRepos = ref<UserRepositoriesResponse>([]);
onBeforeMount(async () => {
  if (settings.value.authToken) {
    const data = await fetchCurrentUserRepos();
    if (data) userRepos.value = data;
  }
});

const selectedRepos = ref<Repository[]>([]);

defineEmits(["submit"]);
</script>
<style lang="scss">
.user-repos-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 50vh;
  overflow: hidden;
  ul {
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

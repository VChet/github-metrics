<template>
  <li class="repo">
    <header class="repo__header">
      <a :href="repo.html_url">
        <h1 class="repo__header-name">
          <icon-template v-if="repo.is_template" />
          <span class="text-truncate">
            {{ settings.showOwner ? repo.full_name : repo.name }}
          </span>
          <icon-brand-github />
        </h1>
      </a>
      <div class="repo__header-actions">
        <button
          title="delete repo"
          type="button"
          class="icon-button icon-button--negative"
          @click="$emit('delete', repo.id)"
        >
          <icon-trash />
        </button>
        <icon-grip-vertical class="repo__header-actions-handler" />
      </div>
    </header>
    <section class="repo__body">
      <div>
        <div>{{ repo.language }}</div>
        <div v-if="repo.license && repo.license.spdx_id !== 'NOASSERTION'">
          {{ repo.license.spdx_id }}
        </div>
        <a v-if="repo.homepage" :href="repo.homepage">
          {{ repo.hostingName ?? "Homepage" }}
          <icon-external-link />
        </a>
      </div>
      <div>
        <a :href="`https://github.com/${repo.full_name}/stargazers`" title="stars">
          <icon-star />
          {{ repo.stargazers_count }}
        </a>
        <a :href="`https://github.com/${repo.full_name}/forks`" title="forks">
          <icon-git-fork />
          {{ repo.forks_count }}
        </a>
        <a :href="`https://github.com/${repo.full_name}/issues`" title="open issues">
          <icon-circle-dot />
          {{ repo.open_issues_count }}
        </a>
      </div>
      <footer v-if="Object.keys(repo.integrations).length">
        <img v-if="repo.uptimerobotImage" :src="repo.uptimerobotImage" alt="uptimerobot ratio" />
        <img v-if="repo.hostingStatusImage" :src="repo.hostingStatusImage" alt="hosting status" />
        <img v-if="repo.bundlerImage" :src="repo.bundlerImage" alt="bundler" />
        <img v-if="repo.analyticsImage" :src="repo.analyticsImage" alt="analytics" />
        <img v-if="repo.testsImage" :src="repo.testsImage" alt="tests" />
      </footer>
    </section>
  </li>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import {
  IconBrandGithub,
  IconTemplate,
  IconGripVertical,
  IconTrash,
  IconGitFork,
  IconCircleDot,
  IconStar,
  IconExternalLink
} from "@tabler/icons-vue";
import { settings } from "@/store/settings";
import { Repository } from "@/classes/Repo";
import { storage } from "@/store/repositories";

const props = defineProps<{ repo: Repository }>();
defineEmits(["delete"]);

const repoData = ref(props.repo);
onBeforeMount(async () => {
  if (!(repoData.value instanceof Repository)) {
    const repoInstance = await Repository.init(props.repo.full_name, props.repo.integrations);
    if (!repoInstance) throw new Error("repo not found");
    const repoIndex = storage.value.repositories.findIndex(({ id }) => repoInstance.id === id);
    if (repoIndex !== -1) {
      storage.value.repositories[repoIndex] = repoInstance;
    } else {
      storage.value.repositories.push(repoInstance);
    }
  }
});
</script>
<style lang="scss">
.repo {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--base-dimmed);
  border-radius: var(--radius);
  transition: border-color 0.3s;
  &:hover,
  &:focus-within {
    border-color: var(--base);
  }
  &__header {
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    &-name {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      min-width: 0;
      margin: 0;
      font-size: 1rem;
    }
    &-actions {
      display: flex;
      gap: 0.5rem;
      align-items: baseline;
      &-handler {
        cursor: grab;
        &:hover {
          color: var(--accent);
        }
      }
    }
  }
  &__body {
    display: grid;
    grid-template-columns: auto auto;
    gap: 0.5rem;
    align-items: flex-end;
    justify-content: space-between;
    > div {
      display: flex;
      gap: 0.375rem;
      &:first-of-type {
        flex-direction: column;
      }
      &:last-of-type {
        justify-content: flex-end;
      }
    }
    footer {
      display: flex;
      grid-column: 1 / -1;
      gap: 0.5rem;
    }
  }
}
</style>

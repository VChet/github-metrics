<template>
  <li class="repo">
    <header class="repo__header">
      <h1 class="repo__header-name">
        <icon-template v-if="repo.is_template" />
        <icon-lock v-if="repo.private" />
        <icon-archive v-if="repo.archived" />
        <a :href="repo.html_url" class="text-truncate icon-button">
          {{ settings.showOwner ? repo.full_name : repo.name }}
        </a>
      </h1>
      <div class="repo__header-actions">
        <edit-repo :repo="repo" />
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
          {{ hostingName ?? "Homepage" }}
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
      <footer v-if="hasIntegrations">
        <img v-if="uptimerobotImage" :src="uptimerobotImage" alt="uptimerobot ratio" />
        <img v-if="hostingStatusImage" :src="hostingStatusImage" alt="hosting status" />
        <img v-if="bundlerImage" :src="bundlerImage" alt="bundler" />
        <img v-if="analyticsImage" :src="analyticsImage" alt="analytics" />
        <img v-if="testsImage" :src="testsImage" alt="tests" />
      </footer>
    </section>
  </li>
</template>
<script setup lang="ts">
import { computed } from "vue";
import {
  IconArchive,
  IconCircleDot,
  IconExternalLink,
  IconGitFork,
  IconGripVertical,
  IconLock,
  IconStar,
  IconTemplate,
  IconTrash
} from "@tabler/icons-vue";
import EditRepo from "@/components/modals/edit-repo.vue";
import { settings } from "@/store/settings";
import { Repository, useRepository } from "@/composable/Repo";

const props = defineProps<{ repo: Repository }>();
defineEmits(["delete"]);

// Watch deep changes
const repo = computed(() => props.repo);
const { hasIntegrations, hostingName, uptimerobotImage, hostingStatusImage, bundlerImage, analyticsImage, testsImage } =
  useRepository(repo);
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
    gap: 1rem;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    &-name {
      display: inline-flex;
      gap: 0.125rem;
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
      flex-wrap: wrap;
      grid-column: 1 / -1;
      gap: 0.5rem;
    }
  }
}
</style>

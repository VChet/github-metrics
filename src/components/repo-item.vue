<template>
  <li class="repo">
    <header class="repo__header">
      <h1 class="repo__header-name">
        <icon-git-fork v-if="repo.fork" />
        <icon-template v-if="repo.is_template" />
        <icon-lock v-if="repo.private" />
        <icon-archive v-if="repo.archived" />
        <a v-dompurify-html="repoName" :href="repo.html_url" class="text-truncate icon-button" />
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
    <div class="repo__body">
      <ul class="repo__body-list">
        <li v-if="repo.language">
          <icon-alphabet-latin />
          {{ repo.language }}
        </li>
        <li :class="{ error: !license }">
          <icon-license />
          {{ license ?? "N/A" }}
        </li>
        <li v-if="repo.integrations.bundler">
          <icon-box />
          {{ repo.integrations.bundler }}
        </li>
        <li v-if="repo.integrations.tests">
          <icon-list-check />
          {{ repo.integrations.tests }}
        </li>
        <li v-if="repo.integrations.analytics">
          <icon-timeline />
          {{ repo.integrations.analytics }}
        </li>
        <li v-if="repo.homepage">
          <a :href="repo.homepage">
            <icon-external-link />
            {{ hostingName ?? "Homepage" }}
          </a>
        </li>
      </ul>
      <footer class="repo__body-footer">
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
        <div v-if="hasIntegrations">
          <img v-if="hostingStatusImage" :src="hostingStatusImage" alt="hosting status">
          <img v-if="uptimerobotImage" :src="uptimerobotImage" alt="uptimerobot ratio">
        </div>
      </footer>
    </div>
  </li>
</template>
<script setup lang="ts">
import { computed } from "vue";
import {
  IconAlphabetLatin,
  IconArchive,
  IconBox,
  IconCircleDot,
  IconExternalLink,
  IconGitFork,
  IconGripVertical,
  IconLicense,
  IconListCheck,
  IconLock,
  IconStar,
  IconTemplate,
  IconTimeline,
  IconTrash
} from "@tabler/icons-vue";
import EditRepo from "@/components/modals/edit-repo.vue";
import { settings } from "@/store/settings";
import type { Repository } from "@/composable/Repo";
import { useRepository } from "@/composable/Repo";

const props = defineProps<{ repo: Repository, query: string }>();
defineEmits(["delete"]);

// Watch deep changes
const repo = computed(() => props.repo);
const repoName = computed<string>(() => {
  const name = settings.value.showOwner ? repo.value.full_name : repo.value.name;
  if (!props.query) return name;
  return name.replace(new RegExp(props.query, "gi"), (match) => `<mark>${match}</mark>`);
});
const { hasIntegrations, hostingName, uptimerobotImage, hostingStatusImage, license } = useRepository(repo);
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
      display: none;
      gap: 0.5rem;
      align-items: baseline;
      .repo:hover &,
      .repo:focus-within & {
        display: flex;
      }
      &-handler {
        cursor: grab;
        &:hover {
          color: var(--accent);
        }
      }
    }
  }
  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    > * {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }
    &-list {
      flex-direction: column;
      justify-content: space-between;
      max-height: 100px;
      li {
        display: inline-flex;
        gap: 0.375rem;
        align-items: center;
        white-space: nowrap;
        &.error {
          color: #a10000;
        }
      }
    }
    &-footer {
      justify-content: space-between;
      div {
        display: flex;
        gap: 0.375rem;
      }
    }
  }
}
</style>

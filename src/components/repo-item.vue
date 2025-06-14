<template>
  <li class="repo">
    <header class="repo__header">
      <h2 class="repo__header-name">
        <icon-git-fork v-if="repo.fork" />
        <icon-template v-if="repo.is_template" />
        <icon-lock v-if="repo.private" />
        <icon-archive v-if="repo.archived" />
        <a v-dompurify-html="repoName" :href="repo.html_url" class="text-truncate icon-button" />
      </h2>
      <div class="repo__header-actions">
        <edit-repo :repo />
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
    <ul class="repo__body">
      <li v-if="packageManager">
        <icon-brand-npm v-if="packageManager === 'npm'" />
        <icon-brand-pnpm v-else-if="packageManager === 'pnpm'" />
        <icon-brand-yarn v-else-if="packageManager === 'yarn'" />
        {{ packageManager }}
      </li>
      <li v-if="bundler.length">
        <icon-box />
        {{ bundler.join(', ') }}
      </li>
      <li v-if="testFramework.length">
        <icon-list-check />
        {{ testFramework.join(', ') }}
      </li>
      <li v-if="repo.integrations.analytics">
        <icon-timeline />
        {{ repo.integrations.analytics }}
      </li>
      <li v-if="repo.homepage">
        <a :href="repo.homepage">
          <icon-external-link />
          {{ hostingName ?? "Website" }}
        </a>
      </li>
    </ul>
    <footer class="repo__footer">
      <div>
        <span v-if="repo.language">
          <span class="repo__footer-language" :class="`bg-color-${repo.language.toLowerCase()}`" />
          {{ repo.language }}
        </span>
        <a :href="`https://github.com/${repo.full_name}/stargazers`" title="stars">
          <icon-star />
          {{ repo.stargazers_count }}
        </a>
        <a :href="`https://github.com/${repo.full_name}/forks`" title="forks">
          <icon-git-fork />
          {{ repo.forks_count }}
        </a>
        <a :href="`https://github.com/${repo.full_name}/issues?q=is%3Aopen`" title="open issues/prs">
          <icon-circle-dot />
          {{ repo.open_issues_count }}
        </a>
        <span :class="{ error: !license }">
          <icon-scale />
          {{ license ?? "N/A" }}
        </span>
      </div>
      <div v-if="settings.displayBadges && hasBadges">
        <img v-if="hostingStatusBadge" :src="hostingStatusBadge" alt="hosting status">
        <img v-if="uptimerobotBadge" :src="uptimerobotBadge" alt="uptimerobot ratio">
        <img v-if="workflowBadge" :src="workflowBadge" alt="workflow badge">
      </div>
    </footer>
  </li>
</template>
<script setup lang="ts">
import { computed } from "vue";
import {
  IconArchive,
  IconBox,
  IconBrandNpm,
  IconBrandPnpm,
  IconBrandYarn,
  IconCircleDot,
  IconExternalLink,
  IconGitFork,
  IconGripVertical,
  IconListCheck,
  IconLock,
  IconScale,
  IconStar,
  IconTemplate,
  IconTimeline,
  IconTrash
} from "@tabler/icons-vue";
import { useRepository, type Repository } from "@/composable/useRepo";
import { useSettingsStore } from "@/store/settings";
import EditRepo from "./modals/edit-repo.vue";

interface Props {
  repo: Repository
  query: string
}
const props = defineProps<Props>();
defineEmits<{ delete: [repositoryId: Repository["id"]] }>();

const { settings } = useSettingsStore();

// Watch deep changes
const repo = computed(() => props.repo);
const repoName = computed<string>(() => {
  const name = settings.value.displayOwner ? repo.value.full_name : repo.value.name;
  if (!props.query) return name;
  return name.replace(new RegExp(props.query, "gi"), (match) => `<mark>${match}</mark>`);
});
const {
  bundler,
  testFramework,
  hasBadges,
  hostingName,
  uptimerobotBadge,
  hostingStatusBadge,
  workflowBadge,
  packageManager,
  license
} = useRepository(repo);
</script>
<style lang="scss">
.repo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--base-dimmed);
  border-radius: var(--radius);
  transition: border-color 0.3s;
  &:hover,
  &:focus-within {
    border-color: var(--base);
  }
  .error {
    color: var(--negative);
  }
  &__header {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
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
    flex-wrap: wrap;
    gap: 0.5rem;
    li {
      display: inline-flex;
      gap: 0.3rem;
      align-items: center;
      white-space: nowrap;
    }
  }
  &__footer {
    display: grid;
    gap: .5rem;
    justify-content: space-between;
    margin-top: auto;
    div {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      span {
        display: inherit;
        gap: 0.25rem;
        align-items: inherit;
      }
    }
    &-language {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
    }
  }
}
</style>

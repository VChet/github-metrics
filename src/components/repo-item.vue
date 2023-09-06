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
          name="delete-repo"
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
        <a v-if="repo.homepage" :href="repo.homepage">
          {{ getHosting(repo.homepage) ?? "Homepage" }}
          <icon-external-link />
        </a>
      </div>
      <div>
        <a :href="`https://github.com/${repo.full_name}/stargazers`">
          <icon-star />
          {{ repo.stargazers_count }}
        </a>
        <a :href="`https://github.com/${repo.full_name}/forks`">
          <icon-git-fork />
          {{ repo.forks_count }}
        </a>
        <a :href="`https://github.com/${repo.full_name}/issues`">
          <icon-circle-dot />
          {{ repo.open_issues_count }}
        </a>
      </div>
    </section>
  </li>
</template>
<script setup lang="ts">
import { onBeforeMount, ref, type PropType } from "vue";
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

const props = defineProps({
  repo: {
    type: Object as PropType<Repository>,
    required: true
  }
});
defineEmits(["delete"]);

const repoData = ref(props.repo);
onBeforeMount(async () => {
  if (!(repoData.value instanceof Repository)) {
    const updatedData = await Repository.init(props.repo.full_name);
    if (updatedData) repoData.value = updatedData;
  }
});

function getHosting(homepage: string): string | null {
  if (!homepage) return null;
  if (homepage.includes("vercel.app")) {
    return "Vercel";
  } else if (homepage.includes("netlify.app")) {
    return "Netlify";
  } else if (homepage.includes("github.io")) {
    return "GitHub";
  }
  return null;
}
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
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    > div {
      display: flex;
      gap: 0.375rem;
      justify-content: space-between;
      &:first-child {
        flex-direction: column;
      }
    }
  }
}
</style>

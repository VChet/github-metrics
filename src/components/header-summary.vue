<template>
  <div class="summary">
    <icon-book2 />
    {{ storage.repositories.length }}
    <icon-star />
    {{ summary.stars }}
    <icon-git-fork />
    {{ summary.forks }}
    <icon-circle-dot />
    {{ summary.issues }}
  </div>
</template>

<script setup lang="ts">
import { useArrayReduce } from "@vueuse/core";
import { IconCircleDot, IconGitFork, IconStar, IconBook2 } from "@tabler/icons-vue";
import { storage } from "@/store/repositories";

const summary = useArrayReduce(
  () => storage.value.repositories,
  (acc, repo) => ({
    stars: acc.stars + repo.stargazers_count,
    forks: acc.forks + repo.forks_count,
    issues: acc.issues + repo.open_issues_count
  }),
  { stars: 0, forks: 0, issues: 0 }
);
</script>

<style lang="scss">
.summary {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: 1px solid var(--base);
  border-radius: var(--radius);
}
</style>

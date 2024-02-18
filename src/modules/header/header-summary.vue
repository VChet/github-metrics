<template>
  <div class="summary">
    <div class="summary__item">
      <icon-book2 />
      {{ storage.repositories.length }}
    </div>
    <div class="summary__item">
      <icon-star />
      {{ summary.current.stars }}
      <span v-if="diff.stars">
        <icon-arrow-big-up-filled v-if="Math.sign(diff.stars) === 1" class="summary__item--positive" />
        <icon-arrow-big-down-filled v-else class="summary__item--negative" />
        {{ Math.abs(diff.stars) }}
      </span>
    </div>
    <div class="summary__item">
      <icon-git-fork />
      {{ summary.current.forks }}
      <span v-if="diff.forks">
        <icon-arrow-big-up-filled v-if="Math.sign(diff.forks) === 1" class="summary__item--positive" />
        <icon-arrow-big-down-filled v-else class="summary__item--negative" />
        {{ Math.abs(diff.forks) }}
      </span>
    </div>
    <div class="summary__item">
      <icon-circle-dot />
      {{ summary.current.issues }}
      <span v-if="diff.issues">
        <icon-arrow-big-up-filled v-if="Math.sign(diff.issues) === 1" class="summary__item--negative" />
        <icon-arrow-big-down-filled v-else class="summary__item--positive" />
        {{ Math.abs(diff.issues) }}
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  IconArrowBigDownFilled,
  IconArrowBigUpFilled,
  IconBook2,
  IconCircleDot,
  IconGitFork,
  IconStar
} from "@tabler/icons-vue";
import { computed } from "vue";
import { useRepositoriesStore } from "@/store/repositories";
import { useSummaryStorage } from "@/store/summary";

const { storage } = useRepositoriesStore();
const { summary } = useSummaryStorage();

const diff = computed(() => ({
  stars: summary.value.current.stars - summary.value.previous.stars,
  forks: summary.value.current.forks - summary.value.previous.forks,
  issues: summary.value.current.issues - summary.value.previous.issues
}));
</script>
<style lang="scss">
.summary {
  display: inline-flex;
  gap: 0.75rem;
  justify-content: center;
  padding: 0.5rem;
  border: 1px solid var(--base);
  border-radius: var(--radius);
  &__item {
    display: inherit;
    gap: 0.25rem;
    place-items: center;
    span {
      display: inline-flex;
      place-items: center;
      svg {
        width: 0.75rem;
        height: 0.75rem;
      }
    }
    &--positive {
      color: var(--positive);
    }
    &--negative {
      color: var(--negative);
    }
  }
}
</style>

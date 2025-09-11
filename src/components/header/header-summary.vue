<template>
  <div class="summary">
    <div class="summary__item">
      <icon-book2 />
      {{ summary.repos }}
    </div>
    <div class="summary__item">
      <icon-star />
      {{ summary.stars }}
      <metric-delta :delta="summaryDelta.stars" />
    </div>
    <div class="summary__item">
      <icon-git-fork />
      {{ summary.forks }}
      <metric-delta :delta="summaryDelta.forks" />
    </div>
    <div class="summary__item">
      <icon-circle-dot />
      {{ summary.issues }}
      <metric-delta :delta="summaryDelta.issues" inverse />
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  IconBook2,
  IconCircleDot,
  IconGitFork,
  IconStar
} from "@tabler/icons-vue";
import { useSummaryStorage } from "@/store/summary";
import MetricDelta from "../metric-delta.vue";

const { summary, summaryDelta } = useSummaryStorage();
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
      .tabler-icon {
        width: 1em;
        height: 1em;
      }
    }
  }
}
</style>

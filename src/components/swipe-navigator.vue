<template>
  <div v-show="isSwiping && ['left', 'right'].includes(direction)" class="swipe-navigator">
    <div v-if="isLeftChevron" :class="arrowClassList">
      <icon-chevron-left />
    </div>
    <div v-if="isRightChevron" :class="arrowClassList">
      <icon-chevron-right />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-vue";
import { useTabSwipe } from "@/composable/useTabSwipe";
import type { Tab } from "@/types/tab";

interface Props {
  tabs: readonly Tab[]
}
const props = defineProps<Props>();

const { isSwiping, direction, isLeftChevron, isRightChevron } = useTabSwipe(props.tabs);

const arrowClassList = computed<Record<string, boolean>>(() => {
  const key = "swipe-navigator__arrow";
  return {
    [key]: true,
    [`${key}--${direction.value}`]: !!direction.value
  };
});
</script>
<style lang="scss">
.swipe-navigator {
  display: contents;
  &__arrow {
    position: fixed;
    top: 50vh;
    z-index: 10;
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    color: var(--accent);
    background: var(--base-dimmed);
    border-radius: 50%;
    transform: translateY(-50%);
    svg {
      width: 1.125rem;
      height: 1.125rem;
    }
    &--left {
      right: 0.625rem;
    }
    &--right {
      left: 0.625rem;
    }
  }
}
</style>

<template>
  <ul class="tab-selector">
    <li v-for="item in items" :key="item.value">
      <button :class="getTabClassList(item)" type="button" @click="selectedTab = item.value">
        {{ item.text }}
      </button>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { useVModel } from "@vueuse/core";

interface Tab {
  value: string
  text: string
  badge?: boolean
}

const props = defineProps<{ modelValue: Tab["value"], items: Tab[] }>();
const emit = defineEmits<{ "update:modelValue": [value: Tab["value"]] }>();
const selectedTab = useVModel(props, "modelValue", emit);

function getTabClassList(tab: Tab): Record<string, boolean> {
  const key = "tab-selector__button";
  return {
    [key]: true,
    [`${key}--active`]: tab.value === selectedTab.value,
    [`${key}--badge`]: !!tab.badge
  };
}
</script>
<style lang="scss">
.tab-selector {
  display: flex;
  gap: .5rem;
  align-items: center;
  &__button {
    &--active {
      color: var(--accent);
      border-color: var(--accent);
    }
    &--badge {
      position: relative;
      &::after {
        position: absolute;
        top: calc(0% - 0.375rem);
        left: calc(100% - 0.375rem);
        width: 0.75rem;
        height: 0.75rem;
        content: '';
        background: var(--accent);
        border-radius: 50%;
        box-shadow: 0 0 1.25rem 0 var(--accent);
      }
    }
  }
}
</style>

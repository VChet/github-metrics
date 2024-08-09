<template>
  <ul class="tab-selector">
    <li v-for="{ value, text, badge } in items" :key="value">
      <button
        class="tab-selector__button"
        :class="{
          'tab-selector__button--active': selectedTab === value,
          'tab-selector__button--badge': badge
        }"
        type="button"
        @click="selectedTab = value"
      >
        {{ text }}
      </button>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { useVModel } from "@vueuse/core";

const props = defineProps<{ modelValue: string, items: { value: string, text: string, badge?: boolean }[] }>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const selectedTab = useVModel(props, "modelValue", emit);
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

<template>
  <ul class="tab-selector">
    <li v-for="{ value, text } in items" :key="value">
      <button
        class="tab-selector__button"
        :class="{ 'tab-selector__button--active': selectedTab === value }"
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

const props = defineProps<{ modelValue: string, items: { value: string, text: string }[] }>();
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
  }
}
</style>

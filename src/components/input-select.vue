<template>
  <label class="input-select">
    <div class="input-select__label">{{ label }}</div>
    <select v-model="model">
      <option value="">N/A</option>
      <option v-for="(item, index) in items" :key="index" :value="item[itemValue]">
        {{ item[itemText] }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    label?: string | null;
    modelValue: string | number;
    items: readonly Record<string, any>[];
    itemValue?: string;
    itemText?: string;
  }>(),
  {
    label: null,
    modelValue: "",
    itemValue: "value",
    itemText: "name"
  }
);

const emit = defineEmits<(e: "update:modelValue", value: number) => void>();
const model = useVModel(props, "modelValue", emit);
</script>

<style lang="scss">
.input-select {
  display: inline-grid;
  grid-template-columns: min-content 1fr;
  gap: 0.5rem;
  align-items: center;
  select {
    padding: 0.5rem;
    font: inherit;
    color: var(--base);
    appearance: none;
    cursor: pointer;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid var(--base-dimmed);
    outline: none;
    &:hover,
    &:focus-visible {
      outline: 1px solid var(--highlight);
    }
    option {
      background: var(--background);
    }
  }
}
</style>

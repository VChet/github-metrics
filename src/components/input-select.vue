<template>
  <label class="input-select">
    <div class="input-select__label">{{ label }}</div>
    <select v-model="model" :name="name">
      <option value="">N/A</option>
      <option v-for="(item, index) in items" :key="index" :value="item[itemValue]">
        {{ item[itemText] }}
      </option>
    </select>
  </label>
</template>
<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import type { SelectHTMLAttributes } from "vue";

interface InputSelectProps {
  modelValue: string | number
  items: readonly Record<string, any>[]
  name: SelectHTMLAttributes["name"]
  itemValue?: string
  itemText?: string
  label?: string | null
}

const props = withDefaults(defineProps<InputSelectProps>(), { label: null, itemValue: "value", itemText: "name" });

const emit = defineEmits<{ "update:modelValue": [value: number] }>();
const model = useVModel(props, "modelValue", emit, { defaultValue: "" });
</script>
<style lang="scss">
.input-select {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  select {
    flex: 1;
    padding: 0.5rem;
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

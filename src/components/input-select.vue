<template>
  <label class="input-select">
    <div class="input-select__label">{{ label }}</div>
    <select v-model="model" :name>
      <option v-if="!mandatory" value="">N/A</option>
      <option v-for="(item, index) in items" :key="index" :value="item[itemValue]">
        {{ item[itemText] }}
      </option>
    </select>
  </label>
</template>
<script setup lang="ts">
import { onBeforeMount, type SelectHTMLAttributes } from "vue";
import { useVModel } from "@vueuse/core";
import { isNullish } from "@/helpers/validate";

interface Props {
  modelValue: SelectHTMLAttributes["value"]
  name: SelectHTMLAttributes["name"]
  items: readonly Record<string, unknown>[]
  mandatory?: boolean
  itemValue?: string
  itemText?: string
  label?: string | null
}
const props = withDefaults(defineProps<Props>(), {
  mandatory: false,
  itemValue: "value",
  itemText: "name",
  label: null
});
const emit = defineEmits<{ "update:modelValue": [value: Props["modelValue"]] }>();
const model = useVModel(props, "modelValue", emit, { defaultValue: "" });

onBeforeMount(() => {
  if (props.mandatory && isNullish(model.value)) model.value = props.items[0][props.itemValue];
});
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
    outline: none;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid var(--base-dimmed);
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

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
}
interface Props {
  modelValue: Tab["value"]
  items: Tab[]
}
type Emits = {
  "update:modelValue": [value: Props["modelValue"]]
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const selectedTab = useVModel(props, "modelValue", emit);

function getTabClassList(tab: Tab): Record<string, boolean> {
  const key = "tab-selector__button";
  return {
    [key]: true,
    [`${key}--active`]: tab.value === selectedTab.value
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
  }
}
</style>

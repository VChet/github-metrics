<template>
  <icon-refresh ref="refreshIconElement" />
</template>
<script setup lang="ts">
import { useTemplateRef, watch } from "vue";
import { useAnimate, useVModel } from "@vueuse/core";
import { IconRefresh } from "@tabler/icons-vue";

interface Props {
  modelValue: boolean
}
type Emits = {
  "update:modelValue": [value: Props["modelValue"]]
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const active = useVModel(props, "modelValue", emit);

const refreshIconRef = useTemplateRef<SVGElement>("refreshIconElement");
const { play, finish } = useAnimate(refreshIconRef, { transform: "rotate(360deg)" }, 1000);
watch(active, (isActive) => { isActive ? play() : finish(); });
</script>

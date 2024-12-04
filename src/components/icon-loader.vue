<template>
  <icon-refresh ref="refreshIconElement" />
</template>
<script setup lang="ts">
import { useTemplateRef, watch } from "vue";
import { useAnimate, useVModel } from "@vueuse/core";
import { IconRefresh } from "@tabler/icons-vue";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const active = useVModel(props, "modelValue", emit);

const refreshIconRef = useTemplateRef<SVGElement>("refreshIconElement");
const { play, finish } = useAnimate(refreshIconRef, { transform: "rotate(360deg)" }, 1000);
watch(active, (isActive) => { isActive ? play() : finish(); });
</script>

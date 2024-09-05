<template>
  <icon-refresh ref="refreshIcon" />
</template>
<script setup lang="ts">
import { IconRefresh } from "@tabler/icons-vue";
import { useAnimate, useVModel } from "@vueuse/core";
import { useTemplateRef, watch } from "vue";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const active = useVModel(props, "modelValue", emit);

const refreshIcon = useTemplateRef<SVGElement>("refreshIcon");
const { play, finish } = useAnimate(refreshIcon, { transform: "rotate(360deg)" }, 1000);
watch(active, (isActive) => { isActive ? play() : finish(); });
</script>

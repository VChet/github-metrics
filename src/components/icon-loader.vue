<template>
  <icon-refresh ref="refreshIconElement" />
</template>
<script setup lang="ts">
import { useTemplateRef, watch } from "vue";
import { useAnimate } from "@vueuse/core";
import { IconRefresh } from "@tabler/icons-vue";

interface Props {
  active: boolean
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), { persistent: false });

const refreshIconRef = useTemplateRef<SVGElement>("refreshIconElement");
const { play, finish } = useAnimate(refreshIconRef, { transform: "rotate(360deg)" }, {
  duration: 1000,
  iterations: props.persistent ? Infinity : 1
});
watch(() => props.active, (isActive) => { isActive ? play() : finish(); });
</script>

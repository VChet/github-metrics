<template>
  <span>{{ output }}</span>
</template>
<script setup lang="ts">
import { TransitionPresets, useTransition } from "@vueuse/core";
const props = defineProps({
  value: {
    type: Number,
    required: true
  }
});

const output = useTransition(props.value, {
  duration: 1000,
  transition: TransitionPresets.easeInOutCubic
});
</script>

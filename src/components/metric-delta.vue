<template>
  <span v-if="!!delta" :class="classList">
    <component :is="IconComponent" class="metric-delta__icon" />
    {{ Math.abs(delta) }}
  </span>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { IconArrowBigDownFilled, IconArrowBigUpFilled, type Icon } from "@tabler/icons-vue";

interface Props {
  delta: number
  inverse?: boolean
}
const props = withDefaults(defineProps<Props>(), { inverse: false });

const IconComponent = computed<Icon | null>(() => {
  if (props.delta > 0) return IconArrowBigUpFilled;
  if (props.delta < 0) return IconArrowBigDownFilled;
  return null;
});

const classList = computed<Record<string, boolean>>(() => {
  const key = "metric-delta";
  return {
    [key]: true,
    [`${key}--positive`]: props.inverse ? props.delta < 0 : props.delta > 0,
    [`${key}--negative`]: props.inverse ? props.delta > 0 : props.delta < 0
  };
});
</script>
<style lang="scss">
.metric-delta {
  display: inline-flex;
  gap: 0.125rem;
  align-items: center;
  &__icon {
    color: currentcolor;
  }
  &--positive {
     color: var(--positive);
    }
  &--negative {
    color: var(--negative);
   }
}
</style>

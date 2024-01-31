<template>
  <fieldset v-if="!isLoading" class="user-feed">
    <legend>Recent events</legend>
    <div v-if="!items.length">
      No recent events
    </div>
    <ul v-else>
      <li v-for="{ date, username, action, repo, id } in items" :key="id">
        {{ date }}:
        <b>{{ username }}</b>
        {{ action }}
        <b>{{ repo }}</b>
      </li>
    </ul>
  </fieldset>
</template>
<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useEventsStore } from "@/store/events";

const { fetch, isLoading, items } = useEventsStore();

onBeforeMount(fetch);
</script>
<style lang="scss">
.user-feed {
  padding: 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--base-dimmed);
  border-radius: var(--radius);
}
</style>

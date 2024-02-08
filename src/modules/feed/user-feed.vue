<template>
  <fieldset class="user-feed">
    <legend>Recent events</legend>
    <span v-if="!items.length">
      No recent events
    </span>
    <ul v-else>
      <li v-for="{ date, username, action, repo, id } in items" :key="id">
        {{ date }}:
        <a :href="`https://github.com/${username}`">{{ username }}</a>
        {{ action }}
        <a :href="`https://github.com/${repo}`">{{ repo }}</a>
      </li>
    </ul>
  </fieldset>
</template>
<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useEventsStore } from "@/store/events";

const { fetch, items } = useEventsStore();

onBeforeMount(fetch);
</script>
<style lang="scss">
.user-feed {
  padding: 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--base-dimmed);
  border-radius: var(--radius);
  li a {
    font-weight: bold;
  }
}
</style>

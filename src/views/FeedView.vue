<template>
  <fieldset class="user-feed">
    <legend>Recent events</legend>
    <span v-if="!amount">
      No recent events
    </span>
    <ul v-else>
      <li v-for="{ date, username, action, repo, id } in events" :key="id">
        {{ date }}:
        <a :href="`https://github.com/${username}`">{{ username }}</a>
        {{ action }}
        <a :href="`https://github.com/${repo}`">{{ repo }}</a>
      </li>
    </ul>
  </fieldset>
</template>
<script setup lang="ts">
import { useEventsStore } from "@/store/events";

const { events, amount, updateCheck } = useEventsStore();
updateCheck();
</script>
<style lang="scss">
.user-feed {
  padding: 1rem;
  border: 1px solid var(--base-dimmed);
  border-radius: var(--radius);
  li a {
    font-weight: bold;
  }
}
</style>

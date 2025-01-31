<template>
  <section class="user-feed">
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
  </section>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { useEventsStore } from "@/store/events";

const { events, amount, updateCheck } = useEventsStore();
onMounted(updateCheck);
</script>
<style lang="scss">
.user-feed {
  ul {
    display: grid;
    gap: 0.5rem;
    padding-left: 1.25rem;
    list-style: disc;
    li a {
      font-weight: bold;
    }
  }
}
</style>

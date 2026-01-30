<template>
  <section class="user-feed">
    <span v-if="!amount">
      No recent events
    </span>
    <ul v-else>
      <li v-for="{ date, username, action, repo, id, eventUrl } in events" :key="id">
        <time>{{ date }}</time>:
        <a
          :href="`https://github.com/${username}`"
          target="_blank"
          rel="noopener noreferrer"
          :title="`Go to ${username} profile`"
        >
          {{ username }}
        </a>
        {{ action }}
        <span v-if="eventUrl" v-dompurify-html="eventUrl" />
        <a
          :href="`https://github.com/${repo}`"
          target="_blank"
          rel="noopener noreferrer"
          :title="`Go to ${repo} repository`"
        >
          {{ repo }}
        </a>
      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { useEventsStore } from "@/store/events";

const { events, amount } = useEventsStore();
</script>
<style lang="scss">
.user-feed {
  ul {
    display: grid;
    gap: 0.5rem;
    padding-left: 1.25rem;
    list-style-type: circle;
    li {
      a {
        font-weight: bold;
      }
      time {
        font-size: 0.875rem;
        color: var(--accent);
      }
    }
  }
}
</style>

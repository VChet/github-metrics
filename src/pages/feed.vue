<template>
  <section class="user-feed">
    <span v-if="!amount">
      No recent events
    </span>
    <ul v-else>
      <feed-item v-for="event in events" :key="event.id" :data="event" />
    </ul>
  </section>
</template>
<script setup lang="ts">
import { useEventsStore } from "@/store/events";
import FeedItem from "@/components/feed-item.vue";

const { events, amount } = useEventsStore();
</script>
<style lang="scss">
.user-feed {
  ul {
    display: grid;
    gap: 0.5rem;
    justify-items: start;
    padding-left: 1.25rem;
    list-style-type: circle;
    @media (width <= 600px) {
      padding-left: 0;
      list-style-type: none;
    }
  }
}
</style>

<template>
  <main-header class="container" />
  <user-feed v-if="isFeedAvailable" class="container" />
  <repo-grid class="container" />
</template>
<script setup lang="ts">
import { computed } from "vue";
import MainHeader from "@/components/main-header.vue";
import RepoGrid from "@/components/repo-grid.vue";
import UserFeed from "@/components/user-feed.vue";
import { settings } from "@/store/settings";

const isFeedAvailable = computed<boolean>(() => !!settings.value.authToken && !!settings.value.username);
</script>

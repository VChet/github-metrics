<template>
  <main-header class="container" />
  <user-feed v-if="isFeedAvailable" class="container" />
  <repo-grid class="container" />
</template>
<script setup lang="ts">
import { computed } from "vue";
import MainHeader from "@/modules/header/main-header.vue";
import RepoGrid from "@/modules/grid/repo-grid.vue";
import UserFeed from "@/modules/feed/user-feed.vue";
import { useSettingsStore } from "@/store/settings";

const { settings } = useSettingsStore();
const isFeedAvailable = computed<boolean>(() => !!settings.value.authToken && !!settings.value.username);
</script>

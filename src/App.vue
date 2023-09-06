<template>
  <main class="container">
    <header class="main-header">
      <settings-block />
      <add-repo />
    </header>
    <repo-grid />
  </main>
</template>

<script setup lang="ts">
import SettingsBlock from "@/components/settings-block.vue";
import AddRepo from "@/components/add-repo.vue";
import RepoGrid from "@/components/repo-grid.vue";
</script>

<style lang="scss">
.main-header {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin: 1rem 0;
}
</style>

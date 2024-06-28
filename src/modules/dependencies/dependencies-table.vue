<template>
  <div v-if="hasDependencies" class="dependencies-table-wrapper">
    <table class="dependencies-table">
      <thead>
        <th />
        <template v-for="repo in repos" :key="repo.id">
          <th v-if="repo.dependencies">
            {{ repo.name }}
          </th>
        </template>
      </thead>
      <tbody>
        <tr v-for="dep in dependencies" :key="dep">
          <td>{{ dep }}</td>
          <td v-for="repo in repos" :key="repo.id">
            {{ repo.dependencies![dep] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { useRepositoriesStore } from "@/store/repositories";
import { useDependencyTable } from "@/composable/useDependencyTable";

const { storage } = useRepositoriesStore();
const { hasDependencies, repos, dependencies } = useDependencyTable(storage.value.repositories);
</script>
<style lang="scss">
.dependencies-table {
  &-wrapper {
    overflow: auto;
  }
  border-collapse: collapse;
  th, td {
    padding: 0.25rem;
    white-space: nowrap;
    border: 1px solid var(--base-dimmed);
  }
}
</style>

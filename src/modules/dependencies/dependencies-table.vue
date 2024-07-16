<template>
  <div v-if="hasDependencies" class="dependencies-table-wrapper">
    <table class="dependencies-table">
      <thead>
        <th />
        <th v-for="repo in repos" :key="repo.id">
          <a :href="repo.html_url" target="_blank">
            {{ settings.showOwner ? repo.full_name : repo.name }}
          </a>
        </th>
      </thead>
      <tbody>
        <tr v-for="dep in dependencies" :key="dep">
          <td class="text-truncate" :title="dep" :style="{ color: composeHashColorFromString(dep) }">
            <a :href="`https://npmjs.org/${dep}`" target="_blank">
              {{ dep }}
            </a>
          </td>
          <td v-for="repo in repos" :key="repo.id">
            {{ repo.dependencies![dep] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { useDependencyTable } from "@/composable/useDependencyTable";
import { useSettingsStore } from "@/store/settings";
import { composeHashColorFromString } from "@/composable/useLibColor";

const { settings } = useSettingsStore();
const { hasDependencies, repos, dependencies } = useDependencyTable();
</script>
<style lang="scss">
.dependencies-table {
  width: 100%;
  cursor: default;
  border-spacing: 0;
  border-collapse: collapse;
  &-wrapper {
    overflow: auto;
  }
  th, td {
    padding: 0.25rem;
    white-space: nowrap;
    &:first-of-type {
      max-width: 10rem;
    }
    &:not(:first-of-type) {
      text-align: center;
    }
  }
  tr {
    border-bottom: 1px solid var(--base-dimmed);
    transition: background-color 0.1s;
    &:hover,
    &:focus-within {
      background-color: var(--base-dimmed);
    }
  }
}
</style>

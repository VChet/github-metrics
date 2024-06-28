<template>
  <div v-if="hasDependencies" class="dependencies-table-wrapper">
    <table class="dependencies-table">
      <thead>
        <th />
        <template v-for="repo in repos" :key="repo.id">
          <th v-if="repo.dependencies">
            {{ settings.showOwner ? repo.full_name : repo.name }}
          </th>
        </template>
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
import { useRepositoriesStore } from "@/store/repositories";
import { useDependencyTable } from "@/composable/useDependencyTable";
import { useSettingsStore } from "@/store/settings";
import { composeHashColorFromString } from "@/composable/useLibColor";

const { settings } = useSettingsStore();
const { storage } = useRepositoriesStore();
const { hasDependencies, repos, dependencies } = useDependencyTable(storage.value.repositories);
</script>
<style lang="scss">
.dependencies-table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  &-wrapper {
    overflow: auto;
  }
  thead {
    position: sticky;
    top: 0;
    background-color: var(--background);
  }
  tr {
    border-bottom: 1px solid var(--base-dimmed);
  }
  th, td {
    padding: 0.25rem;
    white-space: nowrap;
    &:nth-of-type(1) {
      max-width: 10rem;
    }
  }
}
</style>

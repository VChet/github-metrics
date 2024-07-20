<template>
  <div v-if="hasDependencies" class="dependencies">
    <fieldset v-if="excludedDependencies.size">
      <legend>Excluded dependencies:</legend>
      <div class="dependencies__excluded">
        <button
          v-for="dep in excludedDependencies"
          :key="dep"
          :style="{ color: composeHashColorFromString(dep) }"
          class="icon chip"
          @click="showDependency(dep)"
        >
          {{ dep }}
        </button>
      </div>
    </fieldset>
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
        <tr v-for="dep in dependencies.filter((dep) => !excludedDependencies.has(dep))" :key="dep">
          <td :title="dep" :style="{ color: composeHashColorFromString(dep) }" class="chip">
            <a :href="`https://npmjs.org/${dep}`" target="_blank" class="text-truncate">
              {{ dep }}
            </a>
            <button class="icon" type="button" title="exclude dependency" @click="hideDependency(dep)">
              <icon-square-x />
            </button>
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
import { useStorage } from "@vueuse/core";
import { IconSquareX } from "@tabler/icons-vue";
import { useDependencyTable } from "@/composable/useDependencyTable";
import { useSettingsStore } from "@/store/settings";
import { composeHashColorFromString } from "@/composable/useLibColor";

const { settings } = useSettingsStore();
const { hasDependencies, repos, dependencies } = useDependencyTable();

const excludedDependencies = useStorage("excludedDependencies", new Set<string>(), localStorage, { mergeDefaults: true });
function hideDependency(dep: string) {
  excludedDependencies.value.add(dep);
}
function showDependency(dep: string) {
  excludedDependencies.value.delete(dep);
}
</script>
<style lang="scss">
.dependencies {
  overflow: auto;
  &__excluded {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 0.25rem;
    padding: 0.25rem;
  }
  .chip {
    display: flex;
    gap: 0.25rem;
    .icon {
      margin-left: auto;
      color: var(--negative);
      visibility: hidden;
    }
    &:hover .icon {
      visibility: visible;
    }
  }
  &-table {
    width: 100%;
    cursor: default;
    border-spacing: 0;
    border-collapse: collapse;
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
}
</style>

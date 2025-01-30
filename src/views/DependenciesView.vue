<template>
  <div v-if="hasDependencies" class="dependencies">
    <fieldset v-if="excludedDependencies.size">
      <legend>Excluded dependencies:</legend>
      <div class="dependencies__excluded">
        <button
          v-for="dep in [...excludedDependencies].sort()"
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
        <tr>
          <th />
          <th v-for="repo in repos" :key="repo.id">
            <a :href="repo.html_url" target="_blank">
              {{ settings.displayOwner ? repo.full_name : repo.name }}
            </a>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dep in dependencies.filter((dep) => !excludedDependencies.has(dep))" :key="dep">
          <td :title="dep" :style="{ color: composeHashColorFromString(dep) }" class="chip">
            <button class="icon" type="button" title="exclude dependency" @click="hideDependency(dep)">
              <icon-x />
            </button>
            <a :href="`https://npmjs.org/${dep}`" target="_blank" class="text-truncate">
              {{ dep }}
              <div>{{ latestVersions[dep] ?? '???' }}</div>
            </a>
          </td>
          <td v-for="repo in repos" :key="repo.id" :class="versionDiffClass(dep, repo.dependencies![dep])">
            {{ repo.dependencies![dep] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { IconX } from "@tabler/icons-vue";
import semverDiff from "semver/functions/diff";
import type { ReleaseType } from "semver";
import { useDependencyTable } from "@/composable/useDependencyTable";
import { composeHashColorFromString } from "@/composable/useLibColor";
import { useExcludedDependenciesStore } from "@/store/excluded-dependencies";
import { useLatestVersionsStore } from "@/store/latest-versions";
import { useSettingsStore } from "@/store/settings";

const { settings } = useSettingsStore();
const { hasDependencies, repos, dependencies } = useDependencyTable();

const { excludedDependencies, hideDependency, showDependency } = useExcludedDependenciesStore();

const { latestVersions, updateCheck } = useLatestVersionsStore();
onMounted(updateCheck);

function versionDiffClass(packageName: string, version?: string): ReleaseType | null {
  if (!version) return null;
  const projectVersion = version.replace(/[^0-9.]/g, "");
  const latestVersion = latestVersions.value[packageName];
  if (!projectVersion || !latestVersion) return null;
  const diff = semverDiff(projectVersion, latestVersion);
  return diff ?? null;
}
</script>
<style lang="scss">
.dependencies {
  overflow: auto;
  fieldset {
    margin-bottom: 1rem;
  }
  &__excluded {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    padding: 0.25rem;
    button {
      &:hover,
      &:focus-visible {
        box-shadow: 0 0.25rem 0 -0.125rem currentcolor;
      }
    }
  }
  &-table {
    width: 100%;
    cursor: default;
    border-spacing: 0;
    border-collapse: collapse;
    thead th {
      height: 2.5rem;
      padding-inline: 0.5rem;
    }
    tbody {
      tr {
        border-bottom: 1px solid var(--base-dimmed);
        transition: background-color 0.1s;
        &:hover,
        &:focus-within {
          background-color: var(--base-dimmed);
        }
      }
      td {
        min-width: 5rem;
        padding-block: 0.25rem;
        &.chip {
          display: grid;
          grid-template-columns: 1.5rem 10rem;
          gap: 0.25rem;
          .icon {
            color: var(--negative);
            @media (hover: hover) and (pointer: fine) { // hide icon only on non-touch devices
              visibility: hidden;
            }
          }
          &:hover .icon,
          &:focus-visible .icon {
            visibility: visible;
          }
        }
        &.patch {
          color: #79d297;
          background-color: #79d29726;
        }
        &.minor {
          color: #14b8b8;
          background-color: #14b8b826;
        }
        &.major {
          color: #f35;
          background-color: #ff335526;
        }
      }
    }
    thead th, tbody td {
      white-space: nowrap;
      &:first-of-type {
        div {
          font-size: 0.75rem;
        }
      }
      &:not(:first-of-type) {
        text-align: center;
      }
    }
  }
}
</style>

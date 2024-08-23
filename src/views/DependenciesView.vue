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
              <div>{{ latestVersions[dep] ?? '???' }}</div>
            </a>
            <button class="icon" type="button" title="exclude dependency" @click="hideDependency(dep)">
              <icon-x />
            </button>
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
import { IconX } from "@tabler/icons-vue";
import semverDiff from "semver/functions/diff";
import type { ReleaseType } from "semver";
import { useDependencyTable } from "@/composable/useDependencyTable";
import { useSettingsStore } from "@/store/settings";
import { composeHashColorFromString } from "@/composable/useLibColor";
import { useLatestVersionsStore } from "@/store/latest-versions";
import { useExcludedDependenciesStore } from "@/store/excluded-dependencies";

const { settings } = useSettingsStore();
const { hasDependencies, repos, dependencies } = useDependencyTable();

const { excludedDependencies, hideDependency, showDependency } = useExcludedDependenciesStore();

const { latestVersions, updateCheck } = useLatestVersionsStore();
updateCheck();

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
  }
  .chip {
    display: flex;
    gap: 0.25rem;
    .icon {
      margin-left: auto;
      color: var(--negative);
      @media (hover: hover) and (pointer: fine) {
        // hide icon only on non-touch devices
        display: none;
      }
    }
    &:hover .icon,
    &:focus-visible .icon {
      display: inline-block;
    }
  }
  &-table {
    width: 100%;
    cursor: default;
    border-spacing: 0;
    border-collapse: collapse;
    td {
      &.patch {
        color: #3cb371;
      }
      &.minor {
        color: #009595;
      }
      &.major {
        color: #ff1b46;
      }
    }
    th, td {
      padding: 0.25rem;
      white-space: nowrap;
      &:first-of-type {
        max-width: 12vw;
        div {
          font-size: 0.75rem;
        }
        @media (width <= 600px) {
          max-width: 10rem;
        }
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

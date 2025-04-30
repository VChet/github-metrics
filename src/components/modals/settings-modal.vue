<template>
  <button title="open settings" type="button" @click="open">
    <icon-settings />
    Settings
  </button>
  <teleport to="body">
    <dialog ref="dialogElement" class="settings">
      <header>
        Settings
        <button type="button" name="close" class="icon" @click="close">
          <icon-x />
        </button>
      </header>
      <import-export />
      <form class="settings__form" @submit.prevent="update">
        <fieldset>
          <legend>Interface</legend>
          <label>
            <input v-model="form.displayOwner" name="displayOwner" type="checkbox">
            Display repository owner
          </label>
          <label>
            <input v-model="form.displayBadges" name="displayBadges" type="checkbox">
            Display badges
          </label>
          <input-select v-model="form.theme" name="theme" :items="themes" label="theme:" />
        </fieldset>
        <fieldset>
          <legend>GitHub API</legend>
          <label for="authToken">Token</label>
          <textarea id="authToken" v-model.trim="form.authToken" placeholder="authToken" />
          <ol>
            <li>
              Go to
              <a href="https://github.com/settings/tokens?type=beta" title="github tokens page">
                github.com/settings/tokens
              </a>
            </li>
            <li>Click <b>Generate new token</b></li>
            <li>Add Read-only permissions: Actions, Contents, Metadata</li>
            <li>Click <b>Generate Token</b> and paste it here</li>
          </ol>
        </fieldset>
        <fieldset>
          <legend>Feed</legend>
          <label for="username">GitHub Username</label>
          <input
            id="username"
            v-model="form.username"
            autocomplete="username"
            type="text"
            placeholder="username"
            :disabled="!form.authToken"
          >
        </fieldset>
        <button title="apply settings" type="submit">
          Update
        </button>
      </form>
    </dialog>
  </teleport>
</template>
<script setup lang="ts">
import { reactive, useTemplateRef, watch } from "vue";
import { IconSettings, IconX } from "@tabler/icons-vue";
import { useDialog } from "@/composable/useDialog";
import { deepCopy } from "@/helpers/object";
import { fetchCurrentUser, setAuthToken } from "@/service/octokit";
import { useSettingsStore } from "@/store/settings";
import ImportExport from "@/components/import-export.vue";
import InputSelect from "@/components/input-select.vue";

const themes = [
  { name: "github", value: "github" },
  { name: "beige", value: "beige" },
  { name: "blue", value: "blue" },
  { name: "green", value: "green" },
  { name: "red", value: "red" }
] as const;

const { settings } = useSettingsStore();
const dialogRef = useTemplateRef("dialogElement");
const { open, close } = useDialog(dialogRef);
const form = reactive(deepCopy(settings.value));
watch(settings, (value) => { Object.assign(form, value); }, { deep: true });

async function getUsername(): Promise<void> {
  const user = await fetchCurrentUser();
  if (user) form.username = user.login;
}

async function update(): Promise<void> {
  if (form.authToken && !form.username) await getUsername();
  settings.value = { ...form };
  close();
}

watch(() => settings.value.authToken, setAuthToken);
watch(() => settings.value.theme, (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
}, { immediate: true });
</script>
<style lang="scss">
.settings {
  max-width: 35rem;
  &__form {
    display: grid;
    gap: 1rem;
    fieldset {
      display: grid;
      gap: 1rem;
      padding: .75rem;
    }
  }
}
</style>

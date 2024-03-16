<template>
  <button title="open settings" type="button" @click="open">
    <icon-settings />
    Settings
  </button>
  <teleport to="body">
    <dialog ref="dialogRef" class="settings">
      <header>
        Settings
        <button type="button" name="close" class="icon" @click="close">
          <icon-x />
        </button>
      </header>
      <form class="settings__form" @submit.prevent="update">
        <fieldset>
          <legend>Appearance</legend>
          <label>
            <input v-model="form.showOwner" name="showOwner" type="checkbox">
            Show repository owner
          </label>
          <label>
            <input v-model="form.showBadges" name="showBadges" type="checkbox">
            Show badges
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
            <li>Click "Generate new token"</li>
            <li>Give access to repository metadata and contents</li>
            <li>Click "Generate Token" and paste it here</li>
          </ol>
        </fieldset>
        <fieldset>
          <legend>User Feed</legend>
          <label for="username">GitHub Username</label>
          <input id="username" v-model="form.username" type="text" placeholder="username" :disabled="!form.authToken">
        </fieldset>
        <button title="apply settings" type="submit">
          Update
        </button>
      </form>
    </dialog>
  </teleport>
</template>
<script setup lang="ts">
import { reactive } from "vue";
import { IconSettings, IconX } from "@tabler/icons-vue";
import InputSelect from "@/components/input-select.vue";
import { useSettingsStore } from "@/store/settings";
import { useDialog } from "@/composable/useDialog";
import { fetchCurrentUser } from "@/service/octokit";

const themes = [
  { name: "github", value: "github" },
  { name: "beige", value: "beige" },
  { name: "blue", value: "blue" },
  { name: "green", value: "green" },
  { name: "red", value: "red" }
] as const;

const { settings } = useSettingsStore();
const { element: dialogRef, open, close } = useDialog();
const form = reactive({
  authToken: settings.value.authToken,
  username: settings.value.username,
  showOwner: settings.value.showOwner,
  showBadges: settings.value.showBadges,
  theme: settings.value.theme
});

async function getUsername() {
  const user = await fetchCurrentUser();
  if (user) form.username = user.login;
}

async function update() {
  if (form.authToken && !form.username) await getUsername();
  settings.value = { ...form };
  close();
}
</script>
<style lang="scss">
.settings {
  &__form {
    display: grid;
    gap: 1rem;
    fieldset {
      display: grid;
      gap: 1rem;
      padding: .75rem;
      ol {
        margin: 0 0 1rem 1.5rem;
        a {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>

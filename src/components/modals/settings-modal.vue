<template>
  <button title="open settings" type="button" @click="open">
    <icon-settings />
    Settings
  </button>
  <dialog ref="dialogRef" class="settings">
    <header>Settings</header>
    <form class="settings__form" @submit.prevent="update">
      <label>
        <input v-model="showOwner" type="checkbox" />
        Show repository owner
      </label>
      <label for="authToken">GitHub Token</label>
      <textarea id="authToken" v-model.trim="authTokenInput" placeholder="authToken" />
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
      <button title="set auth token" type="submit" :disabled="!authTokenInput">Update</button>
    </form>
  </dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { IconSettings } from "@tabler/icons-vue";
import { settings } from "@/store/settings";
import { useDialog } from "@/service/modal";
import { setAuthToken } from "@/service/octokit";

const { element: dialogRef, open, close } = useDialog();
const authTokenInput = ref<string>(settings.value.authToken);
const showOwner = ref<boolean>(settings.value.showOwner);

async function update() {
  setAuthToken(authTokenInput.value);
  settings.value.showOwner = showOwner.value;
  close();
}
</script>
<style lang="scss">
.settings {
  max-width: 400px;
  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

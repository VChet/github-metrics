<template>
  <button title="open settings" type="button" @click="open">
    <icon-settings />
    Settings
  </button>
  <dialog ref="dialogRef">
    <header>Settings</header>
    <form class="settings-form" @submit.prevent="update">
      <label>
        <input v-model="showOwner" type="checkbox" />
        Show repository owner
      </label>
      <label for="authToken">GitHub Token</label>
      <textarea id="authToken" v-model.trim="authTokenInput" placeholder="authToken" />
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
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

<template>
  <fieldset class="settings">
    <legend>Settings | Rate Limit: {{ rateLimit }}</legend>
    <label>
      <input v-model="settings.showOwner" type="checkbox" />
      Owners
    </label>
    <form class="settings__token-form" @submit.prevent="setAuthToken(authTokenInput)">
      <input v-model="authTokenInput" placeholder="authToken" />
      <button type="submit" :disabled="!authTokenInput">Set</button>
    </form>
  </fieldset>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { settings } from "@/store/settings";
import { rateLimit, setAuthToken } from "@/services/octokit";

const authTokenInput = ref(settings.value.authToken);
</script>
<style lang="scss">
.settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  &__token-form {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    input {
      flex: 1;
    }
    button {
      padding: 0.5rem;
      border: 1px solid var(--base);
      border-radius: var(--radius);
      &:hover,
      &:focus-visible {
        color: var(--accent);
        border-color: var(--accent);
      }
      &:disabled {
        border-color: var(--base-dimmed);
      }
    }
  }
}
</style>

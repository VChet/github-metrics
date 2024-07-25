<template>
  <button title="open about" type="button" @click="open">
    <icon-tilde />
    About
  </button>
  <teleport to="body">
    <dialog ref="dialogRef" class="about">
      <header>
        About
        <button type="button" name="close" class="icon" @click="close">
          <icon-x />
        </button>
      </header>
      <div class="about__content">
        <div>Not affiliated with GitHub.</div>
        <div>All data is stored locally in your browser's localStorage.</div>
        <a href="https://github.com/VChet/github-metrics">
          <icon-brand-github />
          Source code
        </a>
        <div>
          Last update: {{ commitDate }}
        </div>
      </div>
    </dialog>
  </teleport>
</template>
<script setup lang="ts">
import { IconBrandGithub, IconTilde, IconX } from "@tabler/icons-vue";
import dayjs from "dayjs";
import { useDialog } from "@/composable/useDialog";

const { element: dialogRef, open, close } = useDialog();
const commitDate = dayjs(import.meta.env.VITE_GIT_COMMIT_DATE).format("DD.MM.YY");
</script>
<style lang="scss">
.about {
  max-width: 40vw;
  &__content {
    display: grid;
    gap: 0.5rem;
  }
}
</style>

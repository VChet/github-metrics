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
      <div>
        <p>
          Not affiliated with GitHub.
        </p>
        <p>
          All data is stored locally in your browser's localStorage.
        </p>
        <p>
          <a href="https://github.com/VChet/repo-tracker">
            <icon-brand-github />
            Source code
          </a>
        </p>
      </div>
    </dialog>
  </teleport>
</template>
<script setup lang="ts">
import { IconBrandGithub, IconTilde, IconX } from "@tabler/icons-vue";
import { useDialog } from "@/composable/useDialog";

const { element: dialogRef, open, close } = useDialog();
</script>

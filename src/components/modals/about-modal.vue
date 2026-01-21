<template>
  <button title="open about" type="button" @click="open">
    <icon-tilde />
    About
  </button>
  <teleport to="body">
    <dialog ref="dialogElement" class="about">
      <header>
        About
        <button type="button" name="close" class="icon" @click="close">
          <icon-x />
        </button>
      </header>
      <div class="about__content">
        <div>
          Last app update: {{ commitDate }}
        </div>

        <h2>Acceptance of Terms</h2>
        By accessing or using GitHub Metrics, you agree to be bound by these Terms of Use.
        If you do not agree, do not use the app.

        <h2>Description of Service</h2>
        GitHub Metrics allows users to analyze repository statistics by providing a GitHub API personal access token.
        The app collects repository statistics, build status (if a Netlify site ID is provided), uptime status (if an UptimeRobot monitor key is provided), and more.

        <h2>Data Storage and Privacy</h2>
        <ul>
          <li>All data processed by the app is stored locally in your browser's localStorage.</li>
          <li>The app does not transmit or store any personal data on external servers.</li>
          <li>Users are responsible for safeguarding their GitHub API token.</li>
        </ul>

        <h2>User Responsibilities</h2>
        <ul>
          <li>You must not use the app for any illegal or unauthorized purpose.</li>
          <li>You acknowledge that the accuracy of the displayed data depends on the availability and reliability of GitHub's API.</li>
          <li>You are solely responsible for the security of your GitHub API token and any associated credentials.</li>
        </ul>

        <h2>Limitation of Liability</h2>
        <ul>
          <li>The app is provided "as is" without warranties of any kind.</li>
          <li>The developer is not responsible for any inaccuracies, data loss, or issues arising from the use of the app.</li>
          <li>You use the app at your own risk.</li>
        </ul>

        <h2>Third-Party Services</h2>
        <ul>
          <li>The App interacts with GitHub's API and, optionally, Netlify's, UptimeRobot's services.</li>
          <li>The app is not affiliated with GitHub, Netlify, or UptimeRobot.</li>
        </ul>

        <h2>Changes to Terms</h2>
        The developer reserves the right to update these Terms at any time.
        Continued use of the app after changes constitutes acceptance of the revised Terms.

        <h2>Contact</h2>
        <p>
          For any questions or concerns, please reach out to the developer at the app's
          <a href="https://github.com/VChet/github-metrics" rel="noopener noreferrer" title="Go to GitHub repository">
            GitHub repository
          </a>
        </p>
      </div>
    </dialog>
  </teleport>
</template>
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { IconTilde, IconX } from "@tabler/icons-vue";
import dayjs from "dayjs";
import { useDialog } from "@/composable/useDialog";

const dialogRef = useTemplateRef("dialogElement");
const { open, close } = useDialog(dialogRef);
const commitDate = dayjs(import.meta.env.VITE_GIT_COMMIT_DATE).format("DD.MM.YY");
</script>
<style lang="scss">
.about {
  max-width: 75vw;
  &__content {
    display: grid;
    gap: 1rem;
    ul {
      padding-left: 1.25rem;
      list-style: disc;
    }
    a {
      font-weight: bold;
      text-decoration: underline;
    }
  }
}
</style>

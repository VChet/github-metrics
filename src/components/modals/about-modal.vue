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
        GitHub Metrics is a client-side application for analyzing GitHub repository statistics and status information.
        It can also display build status, uptime status, package information, and other data from third-party services.

        <h2>Data Storage and Privacy</h2>
        <ul>
          <li>The app does not operate a backend server and does not send data to servers operated by the developer.</li>
          <li>Credentials, settings, and cached data are stored locally in your browser's localStorage.</li>
          <li>API requests are made directly from your browser to the corresponding third-party services.</li>
          <li>You are responsible for safeguarding your GitHub authentication token and other credentials.</li>
        </ul>

        <h2>User Responsibilities</h2>
        <ul>
          <li>You must not use the app for any illegal or unauthorized purpose.</li>
          <li>The accuracy and availability of displayed data depend on the respective third-party services.</li>
          <li>When creating a GitHub personal access token, use only the permissions required by the app.</li>
        </ul>

        <h2>Limitation of Liability</h2>
        <ul>
          <li>The app is provided "as is" without warranties of any kind.</li>
          <li>The developer is not responsible for inaccuracies, data loss, service interruptions, or credential exposure resulting from the use of the app.</li>
          <li>You use the app at your own risk.</li>
        </ul>

        <h2>Third-Party Services</h2>
        <ul>
          <li>The app may interact directly with GitHub, Netlify, UptimeRobot, and other third-party services.</li>
          <li>GitHub Metrics is not affiliated with GitHub, Netlify, or UptimeRobot.</li>
        </ul>

        <h2>Local Data Removal</h2>
        You can remove locally stored application data, including credentials and cached data, by clearing the application's data from your browser.

        <h2>Changes to Terms</h2>
        The developer reserves the right to update these Terms at any time.
        Continued use of the app after changes constitutes acceptance of the revised Terms.

        <h2>Contact</h2>
        <p>
          For any questions or concerns, please reach out to the developer at the app's
          <a href="https://github.com/VChet/github-metrics" rel="noopener" title="Go to GitHub repository">
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
import { useDialog } from "@/composable/useDialog";

const dialogRef = useTemplateRef("dialogElement");
const { open, close } = useDialog(dialogRef);
const commitDate = new Intl.DateTimeFormat(
  navigator.language,
  { year: "numeric", month: "long", day: "numeric" }
).format(new Date(import.meta.env.VITE_GIT_COMMIT_DATE));
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

<template>
  <section class="user-feed">
    <span v-if="!amount">
      No recent events
    </span>
    <ul v-else>
      <li v-for="{ date, type, username, action, repo, id, eventUrl } in events" :key="id">
        <time>{{ date }}:</time>
        <component :is="getIconComponent(type)" :style="composeIconStyle(action)" class="user-feed__icon" />
        <a
          :href="`https://github.com/${username}`"
          target="_blank"
          rel="noopener noreferrer"
          :title="`Go to ${username} profile`"
        >
          {{ username }}
        </a>
        {{ action }}
        <span v-if="eventUrl" v-dompurify-html="eventUrl" />
        <a
          :href="`https://github.com/${repo}`"
          target="_blank"
          rel="noopener noreferrer"
          :title="`Go to ${repo} repository`"
        >
          {{ repo }}
        </a>
      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import type { CSSProperties } from "vue";
import {
  IconCalendarEvent,
  IconCircleDot,
  IconEye,
  IconGitFork,
  IconGitPullRequest,
  IconStar,
  IconTag,
  IconUser,
  type Icon
} from "@tabler/icons-vue";
import { useEventsStore, type FeedEvent } from "@/store/events";

const { events, amount } = useEventsStore();

function getIconComponent(type: FeedEvent["type"]): Icon {
  switch (type) {
    case "ForkEvent": return IconGitFork;
    case "IssuesEvent": return IconCircleDot;
    case "MemberEvent": return IconUser;
    case "PublicEvent": return IconEye;
    case "PullRequestEvent": return IconGitPullRequest;
    case "ReleaseEvent": return IconTag;
    case "WatchEvent": return IconStar;
    default: return IconCalendarEvent;
  }
}
function getIconColor(action: FeedEvent["action"]): string | null {
  switch (action) {
    case "opened issue":
    case "opened pull request":
    case "published release":
      return "#3fb950"; // green
    case "merged pull request":
      return "#ab7df8"; // purple
    case "closed issue":
    case "closed pull request":
      return "#f85149"; // red
    case "made public":
    case "starred":
      return "#e3b341"; // yellow
    case "forked":
    case "joined":
      return "#9198a1"; // gray
    default:
      return null;
  }
}
function composeIconStyle(action: FeedEvent["action"]): CSSProperties | null {
  const color = getIconColor(action);
  return color ? { stroke: color } : null;
}
</script>
<style lang="scss">
.user-feed {
  ul {
    display: grid;
    gap: 0.5rem;
    padding-left: 1.25rem;
    list-style-type: circle;
    li {
      a {
        font-weight: bold;
      }
      time {
        font-size: 0.875rem;
        color: var(--accent);
      }
    }
  }
  &__icon {
    width: 1rem;
    height: 1rem;
    margin-inline: .25rem;
    vertical-align: bottom;
  }
}
</style>

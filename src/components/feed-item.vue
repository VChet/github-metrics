<template>
  <li class="feed-item">
    <time class="feed-item__timestamp">{{ data.date }}:</time>
    <component :is="iconComponent" :style="{ stroke: iconColor }" class="feed-item__icon" />
    <span v-if="data.username.includes('github-actions')" class="feed-item__accent">
      {{ data.username }}
    </span>
    <a
      v-else
      :href="`https://github.com/${data.username}`"
      target="_blank"
      rel="noopener noreferrer"
      :title="`Go to ${data.username} profile`"
    >
      {{ data.username }}
    </a>
    {{ data.action }}
    <span v-if="data.eventUrl" v-dompurify-html="data.eventUrl" />
    <a
      :href="`https://github.com/${data.repo}`"
      target="_blank"
      rel="noopener noreferrer"
      :title="`Go to ${data.repo} repository`"
    >
      {{ data.repo }}
    </a>
  </li>
</template>
<script setup lang="ts">
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
import type { FeedEvent } from "@/store/events";

interface Props {
  data: FeedEvent
}
const props = defineProps<Props>();

const iconComponent: Icon = (() => {
  switch (props.data.type) {
    case "ForkEvent": return IconGitFork;
    case "IssuesEvent": return IconCircleDot;
    case "MemberEvent": return IconUser;
    case "PublicEvent": return IconEye;
    case "PullRequestEvent": return IconGitPullRequest;
    case "ReleaseEvent": return IconTag;
    case "WatchEvent": return IconStar;
    default: return IconCalendarEvent;
  }
})();
const iconColor: string | undefined = (() => {
  switch (props.data.action) {
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
      return undefined;
  }
})();
</script>
<style lang="scss">
.feed-item {
  &__timestamp {
    font-size: 0.875rem;
    color: var(--accent);
  }
  &__icon {
    width: 1rem;
    height: 1rem;
    margin-inline: .25rem;
    vertical-align: bottom;
  }
  a, &__accent {
    font-weight: bold;
  }
}
</style>

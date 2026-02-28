<template>
  <li class="feed-item">
    <time class="feed-item__timestamp">{{ data.date }}</time>
    <component :is="icon.component" :style="{ stroke: icon.color }" class="feed-item__icon" />
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
  IconGitMerge,
  IconGitPullRequest,
  IconGitPullRequestClosed,
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

const EVENT_VIEW_MAP: Record<NonNullable<FeedEvent["type"]>, Record<FeedEvent["action"], { component: Icon, color: string }>> = {
  ForkEvent: {
    forked: { component: IconGitFork, color: "var(--base)" }
  },
  IssuesEvent: {
    "opened issue": { component: IconCircleDot, color: "var(--success)" },
    "closed issue": { component: IconCircleDot, color: "var(--danger)" }
  },
  MemberEvent: {
    joined: { component: IconUser, color: "var(--base)" }
  },
  PublicEvent: {
    "made public": { component: IconEye, color: "var(--accent)" }
  },
  PullRequestEvent: {
    "opened pull request": { component: IconGitPullRequest, color: "var(--success)" },
    "closed pull request": { component: IconGitPullRequestClosed, color: "var(--danger)" },
    "merged pull request": { component: IconGitMerge, color: "var(--done)" }
  },
  ReleaseEvent: {
    "published release": { component: IconTag, color: "var(--success)" }
  },
  WatchEvent: {
    starred: { component: IconStar, color: "var(--accent)" }
  }
};
const DEFAULT_ICON = { component: IconCalendarEvent, color: "var(--base)" } as const;

const icon = (() => {
  const { type, action } = props.data;
  if (!type) return DEFAULT_ICON;
  return EVENT_VIEW_MAP[type][action] ?? DEFAULT_ICON;
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
    margin-inline: 0.25rem;
    vertical-align: bottom;
  }
  a, &__accent {
    font-weight: bold;
  }
}
</style>

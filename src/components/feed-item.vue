<template>
  <li class="feed-item">
    <time class="feed-item__timestamp">{{ data.date }}</time>
    <component :is="view.icon" :style="{ stroke: view.color }" class="feed-item__icon" />
    <span v-if="data.username.includes('github-actions')">
      {{ data.username }}
    </span>
    <a
      v-else
      :href="`https://github.com/${data.username}`"
      target="_blank"
      rel="noopener"
      :title="`Go to ${data.username} profile`"
    >
      {{ data.username }}
    </a>
    {{ view.label }}
    <template v-if="data.reference">
      <a :href="data.reference.href" target="_blank" rel="noopener">
        {{ data.reference.label }}
      </a>
      {{ ` ${view.preposition ?? 'in'} ` }}
    </template>
    <a :href="`https://github.com/${data.repo}`" target="_blank" rel="noopener">
      {{ data.repo }}
    </a>
  </li>
</template>
<script setup lang="ts">
import {
  IconAnalyze,
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

interface EventView {
  icon: Icon
  color: string
  label: string
  preposition?: "from"
}
const DEFAULT_VIEW = {
  icon: IconCalendarEvent,
  color: "var(--base)",
  label: "unknown event"
} as const satisfies EventView;
function getEventView(event: FeedEvent): EventView {
  switch (event.type) {
    case "ForkEvent": return { icon: IconGitFork, color: "var(--base)", label: "forked", preposition: "from" };
    case "IssuesEvent":
      switch (event.action) {
        case "opened": return { icon: IconCircleDot, color: "var(--success)", label: "opened issue" };
        case "closed": return { icon: IconCircleDot, color: "var(--danger)", label: "closed issue" };
        default: return { icon: IconCircleDot, color: "var(--base)", label: "updated issue" };
      }
    case "MemberEvent": return { icon: IconUser, color: "var(--base)", label: "joined" };
    case "PublicEvent": return { icon: IconEye, color: "var(--accent)", label: "made public" };
    case "PullRequestEvent":
      switch (event.action) {
        case "opened": return { icon: IconGitPullRequest, color: "var(--success)", label: "opened pull request" };
        case "closed": return { icon: IconGitPullRequestClosed, color: "var(--danger)", label: "closed pull request" };
        case "merged": return { icon: IconGitMerge, color: "var(--done)", label: "merged pull request" };
        default: return { icon: IconGitPullRequest, color: "var(--base)", label: "updated pull request" };
      }
    case "PullRequestReviewEvent": return { icon: IconAnalyze, color: "var(--success)", label: "reviewed pull request" };
    case "ReleaseEvent": return { icon: IconTag, color: "var(--success)", label: "published release" };
    case "WatchEvent": return { icon: IconStar, color: "var(--accent)", label: "starred" };
  }
  return DEFAULT_VIEW;
}
const view = getEventView(props.data);
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
  a {
    font-weight: bold;
  }
}
</style>

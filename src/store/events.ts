import { computed } from "vue";
import { createGlobalState, useLocalStorage, whenever } from "@vueuse/core";
import dayjs from "dayjs";
import { fetchRepositoryEvents } from "@/service/octokit";
import { useSettingsStore } from "@/store/settings";
import { useRepositoriesStore } from "./repositories";
import type { RepoEventsResponse } from "@/types/repo";

type RawEvent = RepoEventsResponse["data"][number];

const TARGET_EVENTS = [
  "ForkEvent",
  "IssuesEvent",
  "MemberEvent",
  "PublicEvent",
  "PullRequestEvent",
  "ReleaseEvent",
  "WatchEvent"
] as const;
const TARGET_ACTIONS = [
  "labeled",
  "unlabeled",
  "assigned",
  "unassigned"
] as const;

function getActionString({ type, payload }: RawEvent): string {
  // Octokit no longer discriminates payload by event.type, so action must be checked at runtime
  switch (type) {
    case "ForkEvent": return "forked";
    case "IssuesEvent": return "action" in payload ? `${payload.action} issue` : "issue";
    case "MemberEvent": return "joined";
    case "PublicEvent": return "made public";
    case "PullRequestEvent": return "action" in payload ? `${payload.action} pull request` : "pull request";
    case "ReleaseEvent": return "action" in payload ? `${payload.action} release` : "release";
    case "WatchEvent": return "starred";
    default: return type ?? "[unknown action]";
  }
}

function composeEventUrl(event: RawEvent): string | null {
  if (event.type === "IssuesEvent" && "issue" in event.payload) {
    const { html_url, number, title } = event.payload.issue;
    return `<a href="${html_url}" rel="noopener" title="Go to issue">#${number} ${title}</a> in `;
  }
  if (event.type === "ForkEvent" && "forkee" in event.payload) {
    const { html_url, full_name } = event.payload.forkee;
    return `<a href="${html_url}" rel="noopener" title="Go to forked repository">${full_name}</a> from `;
  }
  if (event.type === "PullRequestEvent" && "pull_request" in event.payload) {
    const { number } = event.payload.pull_request;
    const html_url = `https://github.com/${event.repo.name}/pull/${number}`;
    return `<a href="${html_url}" rel="noopener" title="Go to pull request">#${number}</a> in `;
  }
  if (event.type === "ReleaseEvent" && "release" in event.payload) {
    const { html_url, name } = event.payload.release;
    return `<a href="${html_url}" rel="noopener" title="Go to release">${name}</a> in `;
  }
  return null;
}

export interface FeedEvent {
  id: RawEvent["id"]
  type: RawEvent["type"]
  repo: RawEvent["repo"]["name"]
  date: string
  username: string
  action: string
  eventUrl?: string | null
}

interface EventsStore {
  lastUpdate: string
  data: FeedEvent[]
};

const DEFAULT_STORE: EventsStore = {
  lastUpdate: dayjs().toISOString(),
  data: []
};

export const useEventsStore = createGlobalState(() => {
  const storage = useLocalStorage<EventsStore>("events", DEFAULT_STORE, { mergeDefaults: true });
  const events = computed<FeedEvent[]>({
    get: () => storage.value.data,
    set: (value) => { storage.value.data = value; }
  });
  const amount = computed<number>(() => events.value.length);
  const lastUpdate = computed({
    get: () => storage.value.lastUpdate,
    set: (value) => { storage.value.lastUpdate = value; }
  });
  const { settings } = useSettingsStore();
  const isFeedAvailable = computed(() => !!settings.value.authToken && !!settings.value.username);

  function isValidEvent(event: RawEvent): boolean {
    if (!event.type || !TARGET_EVENTS.includes(event.type)) return false;
    if (event.actor.login.includes("dependabot")) return false;

    if (!("action" in event.payload)) return true; // Some events don't have an action, so we consider them valid
    return !TARGET_ACTIONS.includes(event.payload.action); // Filter out events with actions that are not relevant
  }

  function formatEvent(event: RawEvent): FeedEvent {
    return {
      id: event.id,
      type: event.type,
      repo: event.repo.name,
      date: dayjs(event.created_at).format("DD MMM, HH:mm"),
      username: event.actor.display_login ?? event.actor.login,
      action: getActionString(event),
      eventUrl: composeEventUrl(event)
    } satisfies FeedEvent;
  }

  const { repositories } = useRepositoriesStore();
  async function fetchAllEvents(): Promise<FeedEvent[]> {
    const fetchPromises = repositories.value.map(({ full_name }) => fetchRepositoryEvents(full_name));
    const response = await Promise.all(fetchPromises);
    return response
      .flatMap(({ data }) => data)
      .filter(isValidEvent)
      .sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at)))
      .map(formatEvent);
  }

  async function updateEvents(): Promise<void> {
    events.value = await fetchAllEvents();
    lastUpdate.value = dayjs().toISOString();
  }

  function updateCheck() {
    const isUpdateNeeded = !lastUpdate.value || dayjs().diff(lastUpdate.value, "hours") >= 1;
    if (isUpdateNeeded) return updateEvents();
  }
  whenever(() => storage.value.lastUpdate, updateCheck, { immediate: true });

  return {
    events,
    amount,
    isFeedAvailable,
    updateEvents
  };
});

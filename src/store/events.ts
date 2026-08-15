import { computed } from "vue";
import { createGlobalState, useLocalStorage, whenever } from "@vueuse/core";
import dayjs from "dayjs";
import { fetchRepositoryEvents } from "@/service/octokit";
import { useSettingsStore } from "@/store/settings";
import { useRepositoriesStore } from "./repositories";
import type { RepoEventsResponse } from "@/types/api/octokit";

type RawEvent = RepoEventsResponse["data"][number];

const TARGET_EVENTS = [
  "ForkEvent",
  "IssuesEvent",
  "MemberEvent",
  "PublicEvent",
  "PullRequestEvent",
  "PullRequestReviewEvent",
  "ReleaseEvent",
  "WatchEvent"
] as const;
const FILTERED_ACTIONS = [
  "labeled",
  "unlabeled",
  "assigned",
  "unassigned"
] as const;

interface EventReference {
  href: string
  label: string
}
function composeReference(event: RawEvent): EventReference | undefined {
  if (event.type === "IssuesEvent" && "issue" in event.payload) {
    const { html_url, number, title } = event.payload.issue;
    return { href: html_url, label: `#${number} ${title}` };
  }
  if (event.type === "ForkEvent" && "forkee" in event.payload) {
    const { html_url, full_name } = event.payload.forkee;
    return { href: html_url!, label: full_name! };
  }
  if (event.type === "PullRequestEvent" && "pull_request" in event.payload) {
    const { number } = event.payload.pull_request;
    const html_url = `https://github.com/${event.repo.name}/pull/${number}`;
    return { href: html_url, label: `#${number}` };
  }
  if (event.type === "PullRequestReviewEvent" && "pull_request" in event.payload && "review" in event.payload) {
    const { number } = event.payload.pull_request;
    const { html_url } = event.payload.review;
    return { href: html_url!, label: `#${number}` };
  }
  if (event.type === "ReleaseEvent" && "release" in event.payload) {
    const { html_url, name } = event.payload.release;
    return { href: html_url, label: name! };
  }
}

export interface FeedEvent {
  id: RawEvent["id"]
  type: RawEvent["type"]
  repo: RawEvent["repo"]["name"]
  date: string
  username: string
  action?: string
  reference?: EventReference
}

interface EventsStore {
  lastUpdate: string
  data: FeedEvent[]
};

const DEFAULT_STORE: EventsStore = {
  lastUpdate: new Date().toISOString(),
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
    return !FILTERED_ACTIONS.includes(event.payload.action); // Filter out events with actions that are not relevant
  }

  function formatEvent(event: RawEvent): FeedEvent {
    return {
      id: event.id,
      type: event.type,
      repo: event.repo.name,
      date: dayjs(event.created_at).format("DD MMM, HH:mm"),
      username: event.actor.display_login ?? event.actor.login,
      action: "action" in event.payload ? event.payload.action : undefined,
      reference: composeReference(event)
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
    lastUpdate.value = new Date().toISOString();
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

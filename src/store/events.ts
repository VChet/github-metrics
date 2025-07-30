import { computed } from "vue";
import { createSharedComposable, useLocalStorage, whenever } from "@vueuse/core";
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
  "WatchEvent"
] as const;

function getActionString({ type, payload }: RawEvent): string {
  switch (type) {
    case "ForkEvent": return "forked";
    case "IssuesEvent": return `${payload.action} issue #${payload.issue!.number} "${payload.issue!.title}" in`;
    case "MemberEvent": return "joined";
    case "PublicEvent": return "made public";
    case "WatchEvent": return "starred";
    default: return type ?? "[unknown action]";
  }
}

interface FeedEvent {
  id: string
  date: string
  username: string
  action: string
  repo: string
}

interface EventsStore {
  lastUpdate: string
  data: FeedEvent[]
};

const DEFAULT_STORE: EventsStore = {
  lastUpdate: dayjs().toISOString(),
  data: []
};

export const useEventsStore = createSharedComposable(() => {
  const storage = useLocalStorage<EventsStore>("events", DEFAULT_STORE, { mergeDefaults: true });
  const events = computed({
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

  function formatEvents(acc: FeedEvent[], event: RawEvent): FeedEvent[] {
    const isTargetEvent = TARGET_EVENTS.some((targetType) => targetType === event.type);
    if (isTargetEvent) {
      acc.push({
        id: event.id,
        date: dayjs(event.created_at).format("DD MMMM HH:mm"),
        username: event.actor.display_login ?? event.actor.login,
        action: getActionString(event),
        repo: event.repo.name
      });
    }
    return acc;
  }

  const { repositories } = useRepositoriesStore();
  async function fetchAllEvents(): Promise<FeedEvent[]> {
    const fetchPromises = repositories.value.map(({ full_name }) => fetchRepositoryEvents(full_name));
    const response = await Promise.all(fetchPromises);
    return response.flatMap(({ data }) => data).reduce(formatEvents, []);
  }

  async function updateEvents(): Promise<void> {
    try {
      events.value = await fetchAllEvents();
    } catch (error) {
      console.error(error);
    }
  }

  function updateCheck() {
    const isUpdateNeeded = !lastUpdate.value || dayjs().diff(dayjs(lastUpdate.value), "hours") >= 1;
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

import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import dayjs from "dayjs";
import type { UserReceivedEventsResponse } from "@/types/repo";
import { fetchCurrentUserReceivedEvents } from "@/service/octokit";
import { useSettingsStore } from "@/store/settings";

type RawEvent = UserReceivedEventsResponse[0];

const TARGET_EVENTS = ["WatchEvent", "ForkEvent"];

function getActionString(action: RawEvent["type"]): string {
  switch (action) {
    case "WatchEvent": return "starred";
    case "ForkEvent": return "forked";
    default: return action ?? "";
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

export function useEventsStore() {
  const storage = useLocalStorage<EventsStore>("events", DEFAULT_STORE, { mergeDefaults: true });
  const events = computed({
    get: () => storage.value.data,
    set: (value) => { storage.value.data = value; }
  });
  const lastUpdate = computed({
    get: () => storage.value.lastUpdate,
    set: (value) => { storage.value.lastUpdate = value; }
  });
  const isEmpty = computed(() => !Object.keys(events.value).length);
  const { settings } = useSettingsStore();
  const isFeedAvailable = computed(() => !!settings.value.authToken && !!settings.value.username);

  function formatEvents(acc: FeedEvent[], { id, type, repo, actor, created_at }: RawEvent): FeedEvent[] {
    const isTargetEvent = TARGET_EVENTS.some((targetType) => targetType === type);
    const isUserRelated = repo.name.startsWith(settings.value.username);
    if (isTargetEvent && isUserRelated) {
      acc.push({
        id,
        date: dayjs(created_at).format("DD.MM.YY HH:mm"),
        username: actor.display_login ?? actor.login,
        action: getActionString(type),
        repo: repo.name
      });
    }
    return acc;
  }

  async function updateEvents(): Promise<void> {
    try {
      const response = await fetchCurrentUserReceivedEvents();
      events.value = response?.data.reduce(formatEvents, []) ?? [];
    } catch (error) {
      console.error(error);
    }
  }

  function updateCheck() {
    const isUpdateNeeded = !lastUpdate.value || dayjs().diff(dayjs(lastUpdate.value), "hours") >= 1;
    if (isUpdateNeeded) return updateEvents();
  }

  return {
    events,
    isEmpty,
    isFeedAvailable,
    updateEvents,
    updateCheck
  };
}

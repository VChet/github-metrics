import { computed } from "vue";
import { createSharedComposable, useLocalStorage, whenever } from "@vueuse/core";
import dayjs from "dayjs";
import { fetchRepositoryEvents } from "@/service/octokit";
import { useSettingsStore } from "@/store/settings";
import { useRepositoriesStore } from "./repositories";
import type { RepoEventsResponse } from "@/types/repo";

type RawEvent = RepoEventsResponse["data"][number];

const TARGET_EVENTS = ["WatchEvent", "ForkEvent"] as const;

function getActionString(action: RawEvent["type"]): string {
  switch (action) {
    case "WatchEvent": return "starred";
    case "ForkEvent": return "forked";
    default: return action ?? "[unknown action]";
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

import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import dayjs from "dayjs";
import type { UserReceivedEventsResponse } from "@/types/repo";
import { fetchCurrentUserReceivedEvents } from "@/service/octokit";

import { useSettingsStore } from "@/store/settings";

const TARGET_EVENTS = ["WatchEvent", "ForkEvent"];

function getActionString(action: string | null): string {
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

export const useEventsStore = createGlobalState(() => {
  const events = ref<UserReceivedEventsResponse>([]);
  const isLoading = ref(false);

  async function fetch() {
    isLoading.value = true;
    try {
      const response = await fetchCurrentUserReceivedEvents();
      events.value = response?.data ?? [];
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  }

  const { settings } = useSettingsStore();
  const items = computed<FeedEvent[]>(() => events.value.reduce((acc: FeedEvent[], event) => {
    const isTargetEvent = TARGET_EVENTS.some((type) => type === event.type);
    const isUserRelated = event.repo.name.startsWith(settings.value.username);
    if (isTargetEvent && isUserRelated) {
      acc.push({
        id: event.id,
        date: dayjs(event.created_at).format("DD.MM.YY HH:mm"),
        username: event.actor.display_login ?? event.actor.login,
        action: getActionString(event.type),
        repo: event.repo.name
      });
    }
    return acc;
  }, []));

  return { isLoading, fetch, items };
});

import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { useSettingsStore } from "./store/settings";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(() => {
  const { needRefresh, updateServiceWorker } = useSettingsStore();
  if (needRefresh) updateServiceWorker();
});
router.afterEach((to) => {
  const name = to.name?.toString();
  document.title = `${name} | GitHub Metrics`;
});

export default router;

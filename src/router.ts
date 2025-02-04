import { createRouter, createWebHistory } from "vue-router";
import { useSettingsStore } from "./store/settings";

const HomeView = () => import("@/views/HomeView.vue");
const RepositoriesView = () => import("@/views/RepositoriesView.vue");
const DependenciesView = () => import("@/views/DependenciesView.vue");
const FeedView = () => import("@/views/FeedView.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
      redirect: { name: "Repositories" },
      children: [
        { name: "Repositories", path: "/repositories", component: RepositoriesView },
        { name: "Dependencies", path: "/dependencies", component: DependenciesView },
        { name: "Feed", path: "/feed", component: FeedView }
      ]
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "Home", params: {} }
    }
  ]
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

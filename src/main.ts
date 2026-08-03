import { createApp } from "vue";
import router from "./router";
import "@/assets/global.scss";
import App from "./App.vue";

createApp(App)
  .use(router)
  .mount("#app");

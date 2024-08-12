import { createApp } from "vue";
import VueDOMPurifyHTML from "vue-dompurify-html";
import router from "./router";
import App from "./App.vue";
import "@/assets/global.scss";

createApp(App)
  .use(router)
  .use(VueDOMPurifyHTML)
  .mount("#app");

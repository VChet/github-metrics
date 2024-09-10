import { createApp } from "vue";
import VueDOMPurifyHTML from "vue-dompurify-html";
import router from "./router";
import "@/assets/global.scss";
import App from "./App.vue";

createApp(App)
  .use(router)
  .use(VueDOMPurifyHTML)
  .mount("#app");

import { createApp } from "vue";
import VueDOMPurifyHTML from "vue-dompurify-html";
import App from "./App.vue";
import "@/assets/global.scss";

createApp(App).use(VueDOMPurifyHTML).mount("#app");

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// Import erdjs vue.
import { erdjsVue } from "./../dist/erdjs-vue";
import "./../dist/style.css";

import "./assets/main.scss";

const app = createApp(App);
app.use(router);

const erdjs = erdjsVue(
  {
    loadCss: false,
    chain: import.meta.env.VITE_VUE_APP_ENV,
  },
  {
    walletConnectV2ProjectId: import.meta.env.VITE_VUE_APP_WC_PROJECT_ID,
  }
);
app.use(erdjs);

app.mount("#app");

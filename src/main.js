import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { initJsStore } from "./service/idb_service";
initJsStore()
  .then((is) => {
    is ? console.log("db created") : console.log("db opened");
  })
  .catch((ex) => {
    console.error(ex);
    alert(ex.message);
  });

createApp(App).use(router).mount("#app");

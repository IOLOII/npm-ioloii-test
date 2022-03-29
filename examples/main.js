import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// import toast from "~/index";
import mapmmm from '@ioloii/test'
console.log(mapmmm)
Vue.use(mapmmm);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

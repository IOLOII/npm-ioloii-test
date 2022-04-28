import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import elementUI from "element-ui";

Vue.use(elementUI);

import "~@/web-map/components/公路标点图标.js";

Vue.config.productionTip = false;
window._AMapSecurityConfig = {
  securityJsCode: "1cdceeded4002f68832d52b0071f61cf",
};
Vue.prototype.$amapKey = "d3fcaebb2ce850826758ed089c9a8132";
// Vue.prototype.$amapCenter = [113.267021, 23.113628]// gz
// Vue.prototype.$amapCenter = [119.930906,30.869838]// hz
Vue.prototype.$amapCenter = [109.774249, 39.618631]; // eeds

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

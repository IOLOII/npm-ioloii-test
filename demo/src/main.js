import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
import dado from 'dado'
Vue.use(dado)
// import {toast} from 'dado'
// Vue.use(toast)
Vue.prototype.$amapKey = "d3fcaebb2ce850826758ed089c9a8132";
Vue.prototype.$amapCenter = [113.267021, 23.113628];
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

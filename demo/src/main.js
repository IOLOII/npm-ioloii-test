import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
import dado from 'dado'
Vue.use(dado)
// import {toast} from 'dado'
// Vue.use(toast)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

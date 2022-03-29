import toast from './index.vue'

toast.install = function (Vue) {
  Vue.component(toast.name, toast)
}

export default toast

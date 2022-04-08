import videoWrapper from "./index.vue";

videoWrapper.install = function (Vue) {
  Vue.component(videoWrapper.name, videoWrapper);
};

export default videoWrapper;

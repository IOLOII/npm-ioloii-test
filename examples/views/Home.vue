<template>
  <div id="app">
    <toast />
  </div>
</template>
<script>
import toast from "../../packages/index";
import Vue from "vue";
 Vue.use(toast);

export default {
  name: "App",
};
</script>

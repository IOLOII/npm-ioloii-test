<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <!-- <Toast val="123"/> -->
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import Toast from "~@/toast";


export default {
  name: 'Home',
  components: {
    HelloWorld,
    Toast
  }
}
</script>

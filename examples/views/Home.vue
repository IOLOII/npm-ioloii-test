<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <toast/>
  </div>
</template>

<script>
// @ is an alias to /src
import toast from '@packages/toast'


export default {
  name: 'Home',
  components: {
    toast
  }
}
</script>

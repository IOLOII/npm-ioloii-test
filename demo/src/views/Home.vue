<template>
  <div class="home">
    <WebMap />
  </div>
</template>

<script>
  // @ is an alias to /src
  import HelloWorld from '@/components/HelloWorld.vue'

  export default {
    name: 'Home',
    components: {
      HelloWorld
    }
  }
</script>
<style lang="scss">
  .home {
    height: 800px;
    width: 100%;
  }
</style>

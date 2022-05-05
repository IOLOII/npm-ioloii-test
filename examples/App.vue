<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <!-- <router-link to="/about">About</router-link> -->
      <router-link to="/componentsView">componentsView</router-link> |
      <router-link to="/singleComponentView">singleComponentView</router-link>
      <router-link to="/Legend">Legend</router-link>
    </div>
    <router-view />
  </div>
</template>
<script>
  import 'element-ui/lib/theme-chalk/button.css';
  import { Button } from 'element-ui'
  export default {
    components: {
      [Button.name]: Button
    }
  }
</script>

<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    // color: #2c3e50;
    color: white;
  }

  #nav {
    padding: 30px;

    a {
      font-weight: bold;
      // color: #2c3e50;

      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
</style>

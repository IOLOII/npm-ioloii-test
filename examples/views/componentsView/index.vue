<template>
  <div class="component-warpper">
    <WebMap :metaConfig="metaConfig" />
  </div>
</template>

<script>
  // import
  import WebMap from '~@/web-map'
  import { metaConfig } from '~@/web-map/src/metaConfig'
  export default {
    name: 'componentsView',
    components: {
      WebMap
    },
    computed: {
      metaConfig() {
        return metaConfig
      }
    }
  }
</script>

<style lang="scss" scoped>
  .component-warpper {
    width: 800px;
    height: 600px;
    background: #fff;
    border: 1px;
    box-sizing: border-box;
    box-shadow: 0 0 7px 2px #ccc;
    margin: 0 auto;
  }
</style>

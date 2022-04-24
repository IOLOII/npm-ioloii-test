<template>
  <div>hello</div>
</template>

<script>
  // import
  import eventBus from '../eventBus'
  export default {
    data: () => ({
      metaConfig: {}
    }),
    beforeCreate() {
      let emptyObj = {
        metaConfig:{}
      }
      eventBus.$emit('getMetaConfig', { emptyObj})
      this.metaConfig = emptyObj.metaConfig
    }
  }
</script>

<style lang="scss" scoped></style>

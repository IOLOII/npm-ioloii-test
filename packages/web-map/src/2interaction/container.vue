<template>
  <div
    class="webmap-wrapper-layer webmap-wrapper-interaction-container"
    @click.stop="g_click('wrapper-layer')"
  >
    <slot></slot>
  </div>
</template>

<script>
  // import
  import eventBus from '../eventBus'
  export default {
    name: 'Interaction',
    methods: {
      g_click(v) {
        eventBus.$emit('g_click', v)
      }
    }
  }
</script>

<style lang="scss" scoped >
  @import '../css/main.scss';
</style>

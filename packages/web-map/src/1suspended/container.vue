<template>
  <div
    class="webmap-wrapper-layer webmap-wrapper-suspended-container"
    @click.stop="g_click('suspended-layer')"
  >
    <!-- 悬浮层||占位 -->
    <div
      class="webmap-wrapper-suspended-container-block webmap-wrapper-suspended-container-top"
      @click.stop="suspendedClick('top')"
      v-if="$slots.top"
    >
      <Interaction>
        <slot name="top"></slot>
      </Interaction>
    </div>
    <div
      class="webmap-wrapper-suspended-container-block webmap-wrapper-suspended-container-left"
      @click.stop="suspendedClick('left')"
      v-if="$slots.left"
    >
      <Interaction>
        <slot name="left"></slot>
      </Interaction>
    </div>
    <div
      class="webmap-wrapper-suspended-container-block webmap-wrapper-suspended-container-right"
      @click.stop="suspendedClick('right')"
      v-if="$slots.right"
    >
      <Interaction>
        <slot name="right"></slot>
      </Interaction>
    </div>
    <div
      class="webmap-wrapper-suspended-container-block webmap-wrapper-suspended-container-bottom"
      @click.stop="suspendedClick('bottom')"
      v-if="$slots.bottom"
    >
      <Interaction>
        <slot name="bottom"></slot>
      </Interaction>
    </div>
  </div>
</template>

<script>
  // import
  import eventBus from '../eventBus'
  import Interaction from '../2interaction/container.vue'
  export default {
    name: 'Supended',
    components: { Interaction },
    mounted() {},
    methods: {
      g_click(v) {
        eventBus.$emit('g_click', v)
      },
      suspendedClick(v) {
        eventBus.$emit('suspendedClick', v)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../css/main.scss';
</style>

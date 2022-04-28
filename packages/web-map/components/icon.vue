<template>
  <svg class="icon" aria-hidden="true">
    <use :xlink:href="iconHref"></use>
  </svg>
</template>

<script>
  // import
  import './公路标点图标.js'
  export default {
    name: 'Icon',
    props: {
      type: {
        type: String,
        size: [Number, String],
        default: 'iconfont直接点击复制代码 不用添加前缀'
      }
    },
    computed: {
      iconHref() {
        return `#${this.type}`
        // return `#icon-${this.name}`
      }
    }
  }
</script>

<style lang="scss">
  .icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
    cursor: pointer;
  }
</style>

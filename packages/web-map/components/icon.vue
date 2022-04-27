<template>
  <svg class="icon" aria-hidden="true">
    <use :xlink:href="iconHref"></use>
  </svg>
</template>

<script>
  // import
  import './font_3347926_3guahro8h8q.js'
  export default {
    name: 'Icon',
    props: {
      type: String,
      size: [Number, String]
    },
    computed: {
      iconHref() {
        return `#${this.type}`
        // return `#icon-${this.name}`
      }
    }
  }
</script>

<style lang="scss" scoped>
  .icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
    cursor: pointer;
  }
</style>

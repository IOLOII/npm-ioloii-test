<template>
  <svg class="icon" aria-hidden="true">
    <use :xlink:href="iconHref"></use>
  </svg>
</template>

<script>
  // import
  export default {
    name:'Icon',
    props:{
      type:String,
      size:[Number,String]
    },
    computed:{
      iconHref(){
        return `#${this.type}`
        // return `#icon-${this.name}`
      }
    }
  }
</script>

<style lang="scss" scoped></style>

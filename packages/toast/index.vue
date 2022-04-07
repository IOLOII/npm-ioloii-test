<template>
    <iframe
      :src="`/video.html?v=${carNo}`"
      frameborder="1"
      style="width: 400px; height: 400px; margin: 0 auto"
    ></iframe>
</template>

<script>
  // import
  export default {
    name: 'toast',
    props: {
      carNo: String
    }
  }
</script>

<style lang="scss" scoped></style>

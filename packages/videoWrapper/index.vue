<template>
  <div :style="{
    'height': height,
    'width': width
  }" class="ssss">
    <iframe
      :src="`/videoWrapper/video.html?v=${carNo}`"
      frameborder="1"
      style="width: 100%; height: 100%; margin: 0 auto"
    >
    </iframe>
  </div>
</template>

<script>
  // import
  export default {
    name: 'videoWrapper',
    props: {
      carNo: String,
      width: {
        type: String,
        default: '800px'
      },
      height: {
        type: String,
        default: '400px'
      }
    }
  }
</script>

<style lang="scss" scoped></style>

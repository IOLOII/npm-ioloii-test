<template>
  <div class="about">
    <h1>This is an about page</h1>
    <toast />
  </div>
</template>
<script>
  import { toast } from '@ioloii/test'
  console.log(toast)
  export default {
    components: { toast }
  }
</script>

<template>
  <div @click="toast" class="toast">
    toast:{{ val }}
    <el-button type="primary" size="default" @click="toast">123213</el-button>
  </div>
</template>

<script>
  // import
  import { Button } from 'element-ui'
  console.log(Button)
  export default {
    name: 'toast',
    props: {
      val: String
    },
    components: {
      ElButton: Button
    },
    methods: {
      toast() {
        alert(this.val)
      }
    }
  }
</script>

<style lang="scss" scoped>
.el-button{
  background: red;
}
.toast{
  background: yellow;
}
</style>

<script>
  export default {
    name: 'teleport',
    props: {
      // 移动至哪个标签内，最好使用id
      to: {
        type: String,
        required: true
      }
    },
    mounted() {
      document.querySelector(this.to).appendChild(this.$el)
    },
    destroyed() {
      document.querySelector(this.to).removeChild(this.$el)
    },
    render() {
      return this.$scopedSlots.default()
    }
  }

</script>
<style lang="scss" scoped>
  .modal {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .modal > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    width: 300px;
    height: 300px;
    padding: 5px;
  }
</style>

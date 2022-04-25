<script>
  export default {
    name: 'Teleport',
    props: {
      // 移动至哪个标签内，最好使用id
      to: {
        type: String,
        required: true
      }
    },
    mounted() {
      this.$el.className += ' teleport'
      document.querySelector(this.to).appendChild(this.$el)
    },
    destroyed() {
      try {
        document.querySelector(this.to).removeChild(this.$el)
      } catch (error) {}
    },
    render(h) {
      return this.$scopedSlots.default()
    }
  }
</script>

<template>
  <div class="legendItem">
    <div style="padding: 10px" :data-v="JSON.stringify(legendItem)">
      {{ title }}
    </div>
    <div>
      <el-row>
        <!-- <el-col :span="8" v-for="(Item,index) in Object.keys[legendItem][0]">
          <el-tooltip
            class="item"
            effect="dark"
            :content="Item.name"
            placement="right"
            :enterable="false"
          >
            <el-dropdown-item>
              <Icon :type="Item.icon" />
            </el-dropdown-item>
          </el-tooltip>
        </el-col> -->
      </el-row>
    </div>
  </div>
</template>

<script>
  // import
  import 'element-ui/lib/theme-chalk/index.css'
  import Icon from './icon'
  export default {
    name: 'Legend',
    components: {
      Icon
    },
    props: {
      legendItem: {
        type: [Array,Object],
        required: false,
        default: () => []
      },
      title: {
        type: String,
        default: ''
      }
    },
    created() {
      // console.log(this.legendItem)
    }
  }
</script>

<style lang="scss" scoped>
  .legendItem {
    // width: 300px;
    text-align: left;
    background: #e6e6e6;
    box-shadow: 20px 20px 60px #c4c4c4, -20px -20px 60px #ffffff;

    border-radius: 20px;
    padding: 15px;
    box-sizing: border-box;
  }
</style>

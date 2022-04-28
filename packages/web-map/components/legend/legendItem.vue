<template>
  <div class="legendItem">
    <el-tooltip
      class="item"
      effect="dark"
      :content="name"
      placement="top"
      :enterable="false"
    >
      <el-dropdown-item>
        <Icon :type="icon" />
        <!-- <span>{{ name }}</span> -->
      </el-dropdown-item>
    </el-tooltip>
  </div>
</template>

<script>
  // import
  import 'element-ui/lib/theme-chalk/index.css'
  import Icon from '../icon'
  export default {
    name: 'LegendItem',
    components: {
      Icon
    },
    props: {
      name: {
        type: String,
        default: ''
      },
      icon: {
        type: String,
        default: ''
      }
    },
    created() {}
  }
</script>

<style lang="scss" scoped>
  // $wd: min(20em,250px);
  $wd: 2em;
  $backgroundcolor: #ecf5ff;
  .legendItem ::v-deep {
    height: $wd;
    width: $wd;
    background: #ffffff;
    box-shadow: 20px 20px 60px #c4c4c417, -20px -20px 60px #ffffff;
    overflow: hidden;
    border-radius: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4px solid #2196f31f;
    box-sizing: content-box;
    color: white;
    margin: 0 5px 5px;
    .icon {
      width: $wd;
      height: $wd;
    }
    .item {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .el-dropdown-menu__item {
      line-height: 1;
      &:hover {
        background-color: $backgroundcolor;
      }
    }
  }
  .legendItem:hover {
    background-color: $backgroundcolor;
  }
</style>

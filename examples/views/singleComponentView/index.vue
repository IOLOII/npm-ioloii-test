<template>
  <div>
    <!-- split-button -->
    <el-dropdown trigger="click">
      <span class="el-dropdown-link">
        下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-row :gutter="20" style="width: 300px">
          <el-tooltip
            class="item"
            effect="dark"
            content="Top Left 提示文字"
            placement="right"
            :enterable="false"
          >
            <el-col :span="12" :offset="0">
              <el-dropdown-item icon="el-icon-plus"> 黄金糕 </el-dropdown-item>
            </el-col>
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Top Left 提示文字"
            placement="right"
            :enterable="false"
          >
            <el-col :span="12" :offset="0">
              <el-dropdown-item icon="el-icon-plus"> 黄金糕 </el-dropdown-item>
            </el-col>
          </el-tooltip>
        </el-row>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
  // import
  import 'element-ui/lib/theme-chalk/index.css'
  // import 'element-ui/lib/theme-chalk/button.css'
  // import 'element-ui/lib/theme-chalk/tooltip.css'
  // import 'element-ui/lib/theme-chalk/dropdown.css'
  // import 'element-ui/lib/theme-chalk/dropdown-item.css'
  // import 'element-ui/lib/theme-chalk/dropdown-menu.css'
  // import 'element-ui/lib/theme-chalk/button-group.css'
  import {
    Button,
    ButtonGroup,
    Tooltip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    Col,
    Row
  } from 'element-ui'

  export default {
    name: 'Hello',
    components: {
      [Button.name]: Button,
      [ButtonGroup.name]: ButtonGroup,
      [Tooltip.name]: Tooltip,
      [Dropdown.name]: Dropdown,
      [DropdownItem.name]: DropdownItem,
      [DropdownMenu.name]: DropdownMenu,
      [Col.name]: Col,
      [Row.name]: Row
    },
    data() {
      return {}
    },
    methods: {}
  }
</script>
<style lang="scss" scoped>
  .dropDwonItem {
    width: 200px;
    height: 40px;
    background: red;
    display: flex;
    justify-content: center;
    align-content: center;
  }
  .el-dropdown-menu.el-popper {
    transform: translateX(50%);
    left: 0;
  }
</style>

<template>
  <div>
    <!-- split-button -->
    <el-dropdown trigger="click">
      <span class="el-dropdown-link">
        {{ baseDataTitle }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <template v-for="componentObj in baseDataArr">
          <div v-if="componentObj.headLine">
            <span>{{ componentObj.name }}</span>
            <el-checkbox
              v-model="componentObj.value"
              @change="headLineValueChange(componentObj)"
            />
          </div>
          <el-row :gutter="20" style="width: 300px">
            <el-tooltip
              class="item"
              effect="dark"
              :content="item.name"
              placement="right"
              :enterable="false"
              v-for="(item, index) in componentObj.children"
            >
              <el-col :span="12" :offset="0">
                <el-dropdown-item icon="el-icon-plus">
                  <span>{{ item.name }}</span>
                  <el-checkbox
                    v-model="item.value"
                    @change="componentValueChange(componentObj, item)"
                  />
                </el-dropdown-item>
              </el-col>
            </el-tooltip>
          </el-row>
        </template>
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
    Row,
    Checkbox
  } from 'element-ui'

  export default {
    name: 'headPickGroup',
    components: {
      [Button.name]: Button,
      [ButtonGroup.name]: ButtonGroup,
      [Tooltip.name]: Tooltip,
      [Dropdown.name]: Dropdown,
      [DropdownItem.name]: DropdownItem,
      [DropdownMenu.name]: DropdownMenu,
      [Col.name]: Col,
      [Row.name]: Row,
      [Checkbox.name]: Checkbox
    },
    props: {
      // baseDataTitle:{
      //   type:String,
      //   require:true
      // },
      // baseDataArr:{
      //   type:Array,
      //   require:true
      // }
    },
    data() {
      return {
        baseDataTitle: '桥梁',
        baseDataArr: [
          {
            name: '桥梁评定等级',
            icon: 'iconfont XXX',
            headLine: true,
            headLineCheckBox: true,
            headLineCheckBoxValue: false,
            // 一类，二类，三类，四类，五类
            children: [
              { name: '一类', icon: 'iconfont XXX', value: false },
              { name: '二类', icon: 'iconfont XXX', value: false },
              { name: '三类', icon: 'iconfont XXX', value: false },
              { name: '四类', icon: 'iconfont XXX', value: false },
              { name: '五类', icon: 'iconfont XXX', value: false }
            ]
          },
          {
            name: '桥梁分类（长度）',
            icon: 'iconfont XXX',
            headLine: true,
            headLineCheckBox: true,
            headLineCheckBoxValue: false,
            children: [
              // 特大桥，大桥，中桥，小桥
              { name: '特大桥', icon: 'iconfont XXX', value: false },
              { name: '大桥', icon: 'iconfont XXX', value: false },
              { name: '中桥', icon: 'iconfont XXX', value: false },
              { name: '小桥', icon: 'iconfont XXX', value: false }
            ]
          }
        ]
      }
    },
    methods: {
      headLineValueChange(componentObj) {
        componentObj.children.forEach(item => {
          item.value = componentObj.value
        })
        // 触发事件
      },
      componentValueChange(componentObj, item) {
        // 如果所有children中的value都为true，则componentObj中的value都为true
        if (!item.value) {
          componentObj.value = item.value
        } else {
          let isAllTrue = true
          componentObj.children.forEach(item => {
            if (!item.value) {
              isAllTrue = false
            }
          })
          componentObj.value = isAllTrue
        }
        // 触发事件
      },
      // 定义事件
      // 单个元素触发，全元素触发
      /**
       * @description 事件
       * @param {String} type [all,item]
       * @param {Array} eventObj 如果是all，传入componentObj
       * @param {Object} eventObj 如果是item  传入item
       */
      eventEmit({ type = 'all', eventObj, value }) {
        this.$emit('eventHandle', { type, eventObj, value })
      }
    }
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

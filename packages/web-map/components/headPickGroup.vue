<template>
  <div>
    <!-- split-button -->
    <el-popover placement="bottom" :width="width" :trigger="trigger">
      <div v-for="(componentObj, xxx) in baseDataArr" :key="xxx">
        <div v-if="componentObj.headLine">
          <span>{{ componentObj.name }}</span>
          <el-checkbox
            v-model="componentObj.value"
            @change="headLineValueChange(componentObj)"
            v-if="componentObj.headLineCheckBox"
          />
        </div>
        <el-row>
          <el-col
            :span="12"
            :offset="0"
            v-for="(item, yy) in componentObj.children"
            :key="yy"
          >
            <el-tooltip
              class="item"
              effect="dark"
              :content="item.name"
              placement="right"
              :enterable="false"
            >
              <div>
                <el-checkbox
                  v-model="item.value"
                  @change="componentValueChange(componentObj, item)"
                >
                  <span :data-item="JSON.stringify(item)">{{ item.name }}</span>
                </el-checkbox>
              </div>
            </el-tooltip>
          </el-col>
        </el-row>
      </div>
      <el-button slot="reference" size="small" style="margin: 0 10px 5px"
        >{{ baseDataTitle }} <i class="el-icon-arrow-down el-icon--right"></i
      ></el-button>
    </el-popover>
  </div>
</template>

<script>
  /**
   * @author IOLOII
   * @github https://github.com/IOLOII
   * @create date 2022-04-20 20:40:08
   * @modify date 2022-04-20 20:40:08
   * @desc
   * getActivatedItems 返回所有激活的项
   *
   */

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
    // Dropdown,
    // DropdownItem,
    // DropdownMenu,
    Popover,
    Col,
    Row,
    Checkbox
  } from 'element-ui'

  export default {
    name: 'HeadPickGroup',
    components: {
      [Button.name]: Button,
      [ButtonGroup.name]: ButtonGroup,
      [Tooltip.name]: Tooltip,
      // [Dropdown.name]: Dropdown,
      // [DropdownItem.name]: DropdownItem,
      // [DropdownMenu.name]: DropdownMenu,
      [Popover.name]: Popover,
      [Col.name]: Col,
      [Row.name]: Row,
      [Checkbox.name]: Checkbox
    },
    props: {
      baseDataTitle: {
        type: String,
        require: true
      },
      baseDataArr: {
        type: Array,
        require: true
      },
      width: {
        type: Number,
        require: false,
        default: 200
      }
    },
    data() {
      return {
        // baseDataTitle: '桥梁',
        // baseDataArr: [
        //   {
        //     name: '桥梁评定等级',
        //     icon: 'iconfont XXX',
        //     headLine: true,
        //     headLineCheckBox: true,
        //     headLineCheckBoxValue: false,
        //     // 一类，二类，三类，四类，五类
        //     children: [
        //       { name: '一类', icon: 'iconfont XXX', value: false },
        //       { name: '二类', icon: 'iconfont XXX', value: false },
        //       { name: '三类', icon: 'iconfont XXX', value: false },
        //       { name: '四类', icon: 'iconfont XXX', value: false },
        //       { name: '五类', icon: 'iconfont XXX', value: false }
        //     ]
        //   },
        //   {
        //     name: '桥梁分类（长度）',
        //     icon: 'iconfont XXX',
        //     headLine: true,
        //     headLineCheckBox: true,
        //     headLineCheckBoxValue: false,
        //     children: [
        //       // 特大桥，大桥，中桥，小桥
        //       { name: '特大桥', icon: 'iconfont XXX', value: false },
        //       { name: '大桥', icon: 'iconfont XXX', value: false },
        //       { name: '中桥', icon: 'iconfont XXX', value: false },
        //       { name: '小桥', icon: 'iconfont XXX', value: false }
        //     ]
        //   }
        // ]
        activatedItems: []
      }
    },
    // watch: {
    //   baseDataArr: {
    //     handler(v, ov) {
    //       console.log(222222)
    //     },
    //     deep: true
    //   }
    // },
    computed: {
      trigger() {
        if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === 'test') {
          return 'click'
        } else {
          return 'hover'
        }
      }
    },
    // created() {
    //   console.log(123123)
    //   console.log(this.baseDataArr)
    //   const generateSeries = {
    //     get(trapTarget, property, receiver) {
    //       console.log(1231231123123)
    //       return Reflect.get(...arguments)
    //     }
    //   }

    //   this.baseDataArr.forEach(item => {
    //     // proxy处理item的每一个子元素的value
    //     item.children.forEach(child => {
    //       console.log(123)
    //       child = new Proxy(child, generateSeries)
    //     })
    //   })
    // },
    // mounted() {
    //   const generateSeries = {
    //     get(trapTarget, property, receiver) {
    //       console.log(1231231123123)
    //       return Reflect.get(...arguments)
    //     }
    //   }

    //   this.baseDataArr.forEach(item => {
    //     // proxy处理item的每一个子元素的value
    //     item.children.forEach(child => {
    //       console.log(123)
    //       child = new Proxy(child, generateSeries)
    //     })
    //   })

    //   // console.log(this.baseDataArr)
    // },
    methods: {
      console(v, type = 'log') {
        if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === 'test') {
          console[type](v)
        }
      },
      headLineValueChange(componentObj) {
        componentObj.children.forEach(item => {
          item.value = componentObj.value
        })
        // 全选事件
        this.console('触发全选切换')
        this.eventEmit({
          type: 'all',
          eventObj: componentObj,
          value: componentObj.value,
          componentObj
        })
        // TODO: 触发事件
      },
      componentValueChange(componentObj, item) {
        // 如果所有children中的value都为true，则componentObj中的value都为true
        if (!componentObj.childrenMultiple && item.value) {
          let vitem = componentObj.children.find(vitem => {
            return vitem.value === true && vitem !== item
          })
          vitem && (vitem.value = false)
        }
        if (!item.value) {
          // 如果任意一个为false值，则componentObj中的value为false，仅负责显示
          componentObj.value = item.value
          this.eventEmit({
            type: 'item',
            eventObj: item,
            value: item.value,
            componentObj,
            item
          })
        } else {
          let isAllTrue = true
          componentObj.children.forEach(item => {
            if (!item.value) {
              isAllTrue = false
            }
          })
          componentObj.value = isAllTrue
          if (isAllTrue) {
            this.console('单个item变化 触发全选')
            this.eventEmit({
              type: 'all',
              eventObj: componentObj,
              value: isAllTrue,
              componentObj,
              item
            })
          } else {
            this.console('单个item变化 触发单个item')
            this.eventEmit({
              type: 'item',
              eventObj: item,
              value: item.value,
              componentObj,
              item
            })
          }
        }
        // TODO: 触发事件
      },
      // 定义事件
      // 单个元素触发，全元素触发
      /**
       * @description 事件
       * @param {String} type [all,item]
       * @param {Array} eventObj 如果是all，传入componentObj
       * @param {Object} eventObj 如果是item  传入item
       */
      eventEmit({ type = 'all', eventObj, value, componentObj, item = null }) {
        this.$emit('pickHandle', { type, eventObj, value, componentObj, item })
        this.$forceUpdate()
      },
      // 获取所有子元素中value为true的对象并放入activatedItems中
      getActivatedItems(componentObj) {
        let activatedItems = []
        this.baseDataArr.forEach((item, index) => {
          activatedItems[index] = []
          item.children.forEach(child => {
            if (child.value) {
              activatedItems[index].push(child)
            }
          })
        })
        this.activatedItems = activatedItems
        return activatedItems
      },
      // 获取路网中选中的元素
      getActivatedItemLayerName() {
        let activedLayerName = []
        this.baseDataArr.forEach((item, index) => {
          item.children.forEach(child => {
            if (child.value) {
              activedLayerName.push(child.layerName)
            }
          })
        })
        if(activedLayerName.length === 0){
          activedLayerName = null
        }
        return activedLayerName
      }
    }
  }
</script>
<style lang="scss" scoped>
  // .dropDwonItem {
  //   width: 200px;
  //   height: 40px;
  //   background: red;
  //   display: flex;
  //   justify-content: center;
  //   align-content: center;
  // }
  // .el-dropdown-menu.el-popper {
  //   transform: translateX(50%);
  //   left: 0;
  // }
</style>

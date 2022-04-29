<template>
  <div class="treePick">
    <!-- v-for key metaConfig
    v-for groups metaConfig[key]
    v-for metaConfig[key][children] -->
    <div v-for="key in Object.keys(metaConfig)" :key="key" style="padding-bottom: 10px">
      <span style="font-size: 20px; font-weight: 700">{{ key }}</span>
      <div
        v-for="(componentObj, index) in metaConfig[key]"
        :key="index"
        style="padding: 5px"
      >
        <!-- <div v-if="metaConfig[key].length !== 1"> -->
        <el-checkbox
          v-model="componentObj.value"
          @change="headLineValueChange({ componentObj, key })"
          v-if="componentObj.headLineCheckBox"
          style="padding: 5px"
          :data-key="key"
        >
          <span style="font-size: 17px; font-weight: 600">{{ componentObj.name }}</span>
        </el-checkbox>
        <!-- </div> -->
        <el-row style="padding-left: 1.2em">
          <el-col
            :span="24"
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
              <el-checkbox
                v-model="item.value"
                @change="componentValueChange({ componentObj, item, key })"
              >
                <span :data-item="JSON.stringify(item)">{{ item.name }}</span>
              </el-checkbox>
            </el-tooltip>
            <!-- <template v-if="key === '路网'">
              <span
                :disabled="!item.value"
                @click.stop="clearDrawedLine({ componentObj, item, key })"
                >清除</span
              >
            </template> -->
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
  // import
  import eventBus from '../eventBus'
  export default {
    name: 'TreePick',
    data: () => ({
      metaConfig: {}
      // geoLayersManage: {}
    }),
    created() {
      let emptyObj = {
        metaConfig: {},
        keys: ['metaConfig']
      }
      eventBus.$emit('getProp', { emptyObj })
      this.metaConfig = emptyObj.metaConfig

      eventBus.$on('getActivatedLayerName', ({ emptyObj, key }) => {
        emptyObj.activedLayerName = this.getActivatedLayerName(key)
      })
    },
    methods: {
      console(v, type = 'log') {
        if (process.env.NODE_ENV === 'development') {
          console[type](v)
        }
      },
      headLineValueChange({ componentObj, key }) {
        componentObj.children.forEach(item => {
          item.value = componentObj.value
        })
        // 全选事件
        this.console('触发全选切换')
        this.eventEmit({
          type: 'all',
          eventObj: componentObj,
          value: componentObj.value,
          componentObj,
          key
        })
        // TODO: 触发事件
      },
      componentValueChange({ componentObj, item, key }) {
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
            item,
            key
          })
        } else {
          let isAllTrue = true
          // if (Object.keys(this.geoLayersManage).length === 0) {
          //   let emptyObj = {
          //     geoLayersManage: {},
          //     keys: ['geoLayersManage']
          //   }
          //   eventBus.$emit('getProp', { emptyObj })
          //   this.geoLayersManage = emptyObj.geoLayersManage
          // }
          componentObj.children.forEach(item => {
            // if (
            //   !item.value &&
            //   this.geoLayersManage[item.layerName].$children.length === 0
            // ) {
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
              item,
              key
            })
          } else {
            this.console('单个item变化 触发单个item')
            this.eventEmit({
              type: 'item',
              eventObj: item,
              value: item.value,
              componentObj,
              item,
              key
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
      eventEmit({ type = 'all', eventObj, value, componentObj, item = null, key }) {
        eventBus.$emit('pickHandle', { type, eventObj, value, componentObj, item, key })
        this.$forceUpdate()
      },
      /**
       * @deprecated
       * @description 获取所有子元素中value为true的对象并放入activatedItems中
       */
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
      getActivatedLayerName(key = '路网') {
        let activedLayerName = []
        let baseDataArr = this.metaConfig[key]
        baseDataArr.forEach((item, index) => {
          item.children.forEach(child => {
            if (child.value) {
              activedLayerName.push(child.layerName)
            }
          })
        })
        if (activedLayerName.length === 0) {
          activedLayerName = null
        }
        return activedLayerName
      },
      clearDrawedLine({ componentObj, item, key }) {
        //       // 关闭弹窗 回显默认layer
        // this.$parent.$WebMap.triggerEvent('rubOffLine')
        eventBus.$emit('toWebMap', { eventName: 'rubOffLine', eventObj: {} })

        //       this.rubOffLine();
        //       // 可传递事件
        //       this.map.setCenter(this.mapOptions.center);
        //       this.map.setZoom(this.mapOptions.zoom, false, 500);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .treePick {
    text-align: left;
  }
</style>

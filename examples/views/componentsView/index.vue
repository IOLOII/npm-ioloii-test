cover
<template>
  <div class="component-warpper">
    <WebMap
      :metaConfig="metaConfig"
      geoServerUrl="http://14.18.52.99:8000/geoserver/neimenggu/wms"
      geoQueryProp="ROADNAME"
      @loadMapData="loadMapData"
      ref="WebMap"
      @pickHandle="pickGroupEventHandle"
    >
      <template #supendedLeft>
        <SupebdLeft />
      </template>

      <!-- 动画层 -->
      <!-- <template #animeLeft> 12321</template>
       -->
      <template #animeRight> 12313</template>
    </WebMap>
  </div>
</template>

<script>
  // import
  import eventBus from './eventBus'

  import WebMap from '~@/web-map'
  import { metaConfig } from '~@/web-map/src/metaConfig'
  import mixin from './mixin.js'
  import './cover.scss'

  import SupebdLeft from './component/supendedLeft.vue'
  export default {
    name: 'componentsView',
    mixins: [mixin],
    components: {
      WebMap,
      SupebdLeft
    },
    computed: {
      metaConfig() {
        return metaConfig
      },
      tempToken() {
        return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NTA4NTM2MzQsInVzZXJuYW1lIjoiYWRtaW4ifQ.7K3GYKjvL0AGlbk6zLT917VyeZjF-5TJDrbqDqHtGq0'
      }
    },
    created() {
      let _this = this
      eventBus.$on('getMetaConfig', ({ emptyObj }) => {
        emptyObj.metaConfig = _this.metaConfig
      })
    },
    methods: {
      loadMapData({ amapMakersManage, $AMap, map }) {
        // 加载路产 点位
        this.getRoadProperty({
          amapMakersManage,
          $AMap,
          map,
          pointEvent: this.bindPointEvent($AMap)
        })
      },
      // 高德地图元素交互事件
      bindPointEvent($AMap) {
        return {
          type: ['click'], // default click
          click: e => {
            let target = e.target
            let map = e.target.getMap()
            map.setCenter(target.lnglat)
            map.setZoom(17, false, 500)
            let infoWindow = new $AMap.InfoWindow({
              anchor: 'top-left',
              autoMove: true,
              content: target.getExtData().properties.name
            })
            infoWindow.open(map, target.lnglat)
            infoWindow.on('close', () => {
              map.setCenter(this.$refs.WebMap.mapOptions.center)
              map.setZoom(this.$refs.WebMap.mapOptions.zoom, false, 500)
            })

            // TODO: 插入其他元素或页面的交互事件
            // NOTE: 页面其他事件，点渲染，单独维护
            // this.$refs.WebMap.triggerEvent(eventName, eventObj)
          }
        }
      },
      /**
       * @description 顶部区域的事件回调 主要处理由顶部区域点击后的事务
       * @param {String} type 事件类型 单个还是全部 item | all
       * @param {Object} eventObj 事件对象 是item还是item的父级（全选操作）
       * @param {Boolean} value 是否选中
       * @param {Object} componentObj 父级
       * @param {Object} item 子级 如果是父级出发,则会出现空的情况 headLineValueChange事件
       */
      pickGroupEventHandle({ type, eventObj, value, componentObj, item = null, _this }) {
        console.log("message")
        if (!_this) _this = this.$refs.WebMap
        // TODO: 调整这里case 规则
        switch (componentObj.name) {
          case '路网':
            // 展现或隐藏 layer
            // this.console(eventObj.layerName, 'log')
            switch (type) {
              case 'item':
                let reverses = []
                let layerNames = Object.keys(_this.geoLayersManage)
                // 找出layerNames中不包含eventObj.layerName的值
                layerNames.forEach(layerName => {
                  if (layerName !== eventObj.layerName) {
                    reverses.push(layerName)
                  }
                })
                if (value) {
                  _this.geoLayersManage[eventObj.layerName].show()
                  if (!componentObj.childrenMultiple) {
                    reverses.forEach(ln => {
                      _this.test_clearLayerChildren(ln, 'hide')
                    })
                  }
                } else {
                  // 隐藏的时候 当前线路关闭后 显示当前的 其他情况隐藏当前
                  // _this.geoLayersManage[eventObj.layerName].hide();
                  _this.test_clearLayerChildren(eventObj.layerName, 'hide')
                }
                break
              // 路网暂不考虑显示多个layer,已互斥
              case 'all':
                // console.log(type, eventObj, value, componentObj, item)
                componentObj.children.forEach(({ layerName }) => {
                  // console.log(_this.geoLayersManage[layerName])
                  if (value) {
                    _this.geoLayersManage[layerName].show()
                  } else {
                    _this.test_clearLayerChildren(layerName, 'hide')
                  }
                })
                break
            }

            break
          case '桥梁':
          case '桥梁评定等级':
          case '桥梁分类（长度）':
            break
          case '隧道':
            break
          case '涵洞':
            break
          case '路产':
          case '服务设施1':
          case '服务设施2':
          case '管理设施':
            switch (type) {
              case 'item':
                if (value) {
                  _this.amapMakersManage['路产'][componentObj.name][item.prop].forEach(
                    point => {
                      point.marker && point.marker.show()
                    }
                  )
                } else {
                  _this.amapMakersManage['路产'][componentObj.name][item.prop].forEach(
                    point => {
                      point.marker && point.marker.hide()
                    }
                  )
                }
                break
              case 'all':
                if (value) {
                  Object.keys(_this.amapMakersManage['路产'][componentObj.name]).forEach(
                    prop => {
                      _this.amapMakersManage['路产'][componentObj.name][prop].forEach(
                        point => {
                          point.marker && point.marker.show()
                        }
                      )
                    }
                  )
                } else {
                  Object.keys(_this.amapMakersManage['路产'][componentObj.name]).forEach(
                    prop => {
                      _this.amapMakersManage['路产'][componentObj.name][prop].forEach(
                        point => {
                          point.marker && point.marker.hide()
                        }
                      )
                    }
                  )
                }

                break
            }
            break
          default:
            _this.console('缺乏枚举状态')
            _this.console(componentObj.name)
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  // @import './cover.scss';
  .component-warpper {
    width: 800px;
    height: 600px;
    background: #fff;
    border: 1px;
    box-sizing: border-box;
    box-shadow: 0 0 7px 2px #ccc;
    margin: 0 auto;
  }
</style>

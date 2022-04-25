<template>
  <div class="component-warpper">
    <WebMap
      :metaConfig="metaConfig"
      geoServerUrl="http://14.18.52.99:8000/geoserver/neimenggu/wms"
      geoQueryProp="ROADNAME"
      @initializedHandle="initializedHandle"
      @initMapEvevt="initMapEvevt"
      @handleEvent="handleEvent"
      ref="WebMap"
    >
      <template #supendedLeft>
        <SupebdLeft ref="SupebdLeft" />
      </template>

      <!-- 动画层 -->
      <!-- <template #animeLeft> 12321</template>
       -->
      <template #animeRight>
        <span style="display:none"></span>
      </template>
    </WebMap>

    <Teleport to=".webmap-wrapper-anime-container .block.right" v-if="teleportStaticHTML">
      <div style="" class="asdklsmodal" v-html="teleportStaticHTML">></div>
    </Teleport>
  </div>
</template>

<script>
  // import
  import eventBus from './eventBus'

  import WebMap from '~@/web-map'
  import Teleport from '~@/teleport'
  import { metaConfig } from '~@/web-map/src/metaConfig'
  import mixin from './mixin.js'
  import './cover.scss'

  import SupebdLeft from './component/supendedLeft.vue'
  export default {
    name: 'componentsView',
    mixins: [mixin],
    components: {
      WebMap,
      SupebdLeft,
      Teleport
    },
    data: () => ({
      amapMakersManage: null,
      $AMap: null,
      map: null,

      teleportStaticHTML: ''
    }),
    computed: {
      metaConfig() {
        return metaConfig
      },
      tempToken() {
        return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NTA5NDI4NTMsInVzZXJuYW1lIjoiYWRtaW4ifQ.EzIsPK_ewYWtqbsjWm0v72hcD0QmbnXyD52ds4V8_Y0'
      }
    },
    created() {
      let _this = this
      eventBus.$on('getMetaConfig', ({ emptyObj }) => {
        emptyObj.metaConfig = _this.metaConfig
      })
      eventBus.$on('pickHandle', ({ type, eventObj, value, componentObj, item, key }) => {
        this.pickGroupEventHandle({ type, eventObj, value, componentObj, item, key })
      })
    },
    methods: {
      alert(v) {
        if (process.env.NODE_ENV === 'development') {
          this.console(v)
          return
        }
        if (typeof v !== 'string') {
          this.console(JSON.stringify(v))
        } else {
          alert(v)
        }
      },
      console(v, type = 'error') {
        if (process.env.NODE_ENV === 'development') {
          console[type](v)
        }
      },
      initializedHandle({ amapMakersManage, $AMap, map }) {
        this.amapMakersManage = amapMakersManage
        this.$AMap = $AMap
        this.map = map

        this.loadMapData({ amapMakersManage, $AMap, map })
      },
      loadMapData({ amapMakersManage, $AMap, map }) {
        // 路产
        this.getRoadProperty({
          amapMakersManage,
          $AMap,
          map,
          pointEvent: this.bindRoadRropertyPointEvent($AMap)
        })
      },
      /**
       * @description 顶部区域的事件回调 主要处理由顶部区域点击后的事务
       * @param {String} type 事件类型 单个还是全部 item | all
       * @param {Object} eventObj 事件对象 是item还是item的父级（全选操作）
       * @param {Boolean} value 是否选中
       * @param {Object} componentObj 父级
       * @param {Object} item 子级 如果是父级出发,则会出现空的情况 headLineValueChange事件
       */
      /**
       * @description 点击复选框事件
       */
      pickGroupEventHandle({
        type,
        eventObj,
        value,
        componentObj,
        item = null,
        _this,
        key
      }) {
        // key 大类 路网 桥梁 隧道 涵洞 路产
        if (!_this) _this = this.$refs.WebMap
        if (!_this) console.error('WebMap is empty, maybe dom timeout, please refresh')
        // TODO: 调整这里case 规则
        switch (key) {
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
          // case '桥梁评定等级':
          // case '桥梁分类（长度）':
          case '隧道':
          // case '隧道评定等级':
          // case '隧道分类（长度）':
          case '涵洞':
            // case '涵洞位置':
            // case '行政等级':
            console.log(type, eventObj, value, componentObj, item, _this)
            // 生成查询条件
            let { prop } = componentObj
            // 获取同父下其他类目
            let params = {}
            let sendReq = false
            this.metaConfig[key].forEach(component => {
              params[component.prop] = []
              component.children.forEach(child => {
                if (child.value) {
                  params[component.prop].push(child[component.prop + 'Value'])
                  sendReq = true
                }
              })
            })
            if (this.amapMakersManage[key]) {
              this.amapMakersManage[key].forEach(item => {
                try {
                  item.marker.remove()
                } catch (e) {
                  this.console(item)
                }
              })
            }
            if (sendReq) {
              this.amapMakersManage[key] = []
              this.get_Culvert_Bridge_Tunnel({
                amapMakersManage: this.amapMakersManage,
                $AMap: this.$AMap,
                map: this.map,
                params,
                key,
                pointEvent: this.bind_Culvert_Bridge_Tunnel(this.$AMap)
              })
            }

            break
          case '路产':
            // case '服务设施1':
            // case '服务设施2':
            // case '管理设施':
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
      },
      initMapEvevt() {
        this.map.on('click', ({ target, lnglat, pixel, type }) => {
          this.$refs.WebMap.test_layerClicked(lnglat)
        })
        if (process.env.NODE_ENV === 'development') {
          this.map.on('mousewheel', ({ target, lnglat, pixel, type }) => {
            console.log(this.map.getZoom())
          })
          this.map.on('mousemove', ({ target, lnglat, pixel, type }) => {
            const { lat, lng } = lnglat
          })
        }
      },
      // 与之相反是 triggerEvent
      handleEvent({ eventName, eventObj }) {
        console.log(eventName, eventObj)
        switch (eventName) {
          case 'getActivatedLayerName':
            let { emptyObj, key } = eventObj
            eventBus.$emit(eventName, { emptyObj, key })
            break
          case 'layerLineDetail':
            let { pointInfo } = eventObj
            console.log(pointInfo)
            this.$refs.WebMap.triggerEvent('animeMove', {
              direction: 'right',
              isShow: true
            })
            this.$nextTick(() => {
              this.teleportStaticHTML = `
                <div>
                  <div>
                    <span style="color: #0048BA;margin-right: 10px;">
                      路线编号
                    </span>
                    <span>${pointInfo.properties.ROADCODE}</span>
                  </div>
                  <div >
                    <span style="color: #0048BA;margin-right: 10px;">
                      路线名称
                    </span>
                    <span>${pointInfo.properties.ROADNAME}</span>
                  </div>
                </div>
              `
            })
            break
          default:
            this.console(`事件未捕获： HandleEvent_${eventName}`)
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  // @import './cover.scss';
  .component-warpper {
    width: 1200px;
    height: 600px;
    background: #fff;
    border: 1px;
    box-sizing: border-box;
    box-shadow: 0 0 7px 2px #ccc;
    margin: 0 auto;
  }
</style>

<style lang="scss">
  // ### for
  .teleport {
    text-align: left;
    &.asdklsmodal {
      // background: red;
    }
  }
</style>

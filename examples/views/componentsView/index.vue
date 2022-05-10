<template>
  <div class="component-warpper">
    <WebMap
      :metaConfig="metaConfig"
      geoServerUrl="http://14.18.52.99:8000/geoserver/luan/wms"
      geoQueryProp="LXBM"
      @initializedHandle="initializedHandle"
      @initMapEvevt="initMapEvevt"
      @handleEvent="handleEvent"
      ref="WebMap"
      v-loading="loading"
      element-loading-text="加载中"
      :hasLegend="true"
    >
      <!-- 支持top left bottom -->
      <template #supendedLeft>
        <SupebdLeft ref="SupebdLeft" />
      </template>

      <!-- 动画层 -->
      <!-- <template #animeLeft> 12321</template>
       -->
      <!-- 支持left right -->
      <template #animeRight>
        <span style="display: none"></span>
      </template>
    </WebMap>

    <Teleport to=".webmap-wrapper-anime-container .block.right">
      <div class="teleport">
        <div v-html="teleportStaticHTML" v-if="teleportStaticHTML"></div>
        <div v-else="teleportStaticHTML">
          <div style="text-align: center">当前暂无内容</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
  // import
  import WebMap from '~@/web-map'
  import Teleport from '~@/teleport'

  // import  '~@/web-map/components/公路标点图标.js'
  import './公路标点图标.css'

  import eventBus from './eventBus'
  import mixin from './mixin.js'
  import SupebdLeft from './component/supendedLeft.vue'
  import { metaConfig } from './metaConfig'

  export default {
    name: 'componentsView',
    mixins: [mixin],
    components: {
      WebMap,
      Teleport,
      SupebdLeft
    },
    provide() {
      return {
        tempToken: this.tempToken,
        tempService: this.tempService
      }
    },
    data: () => ({
      teleportStaticHTML: '',
      loading: false
    }),
    computed: {
      metaConfig() {
        return metaConfig
      },
      tempToken() {
        if (process.env.NODE_ENV === 'test') {
          return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NTIyMzg3NTksInVzZXJuYW1lIjoiYWRtaW4ifQ.eELd7A8oKNiywHSLrIgqu9cXRUDXukEp3ioBNtUMfnU'
        } else {
          return this.$cookie.get('token')
        }
      },
      tempService() {
        if (process.env.NODE_ENV === 'test') {
          // return 'https://yx.91jt.net/testroad'
          return '/testroad'
        } else {
          return ''
        }
      }
    },
    methods: {
      initializedHandle({ amapMakersManage, $AMap, map }) {
        this.$WebMap = this.$refs.WebMap
        this.amapMakersManage = amapMakersManage
        this.$AMap = $AMap
        this.map = map
        this.loadMapData({ amapMakersManage, $AMap, map })
      },
      /**
       * @description 初始化地图数据
       * @param {Object} param
       * @param {Object} param.amapMakersManage 地图标记管理器 根据metaConfig 生成，其中overlays用于存放不同业务模块中的标记，业务模块中单独管理
       * @param {Object} param.$AMap 地图构造函数
       * @param {Object} param.map 地图实例
       */
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
       * @description 点击复选框事件回调
       * @param {Object} param
       * @param {String} param.type 事件类型 单个还是全部 item | all
       * @param {Object} param.eventObj 事件对象 是item还是item的父级（全选操作）
       * @param {Boolean} param.value 是否选中
       * @param {Object} param.componentObj 父级
       * @param {Object} param.item 子级 如果是父级出发,则会出现空的情况 headLineValueChange事件
       */
      pickGroupEventHandle({
        type,
        eventObj,
        value,
        componentObj = {},
        item = {},
        _this,
        key
      }) {
        // key 大类 路网 桥梁 隧道 涵洞 路产
        if (!_this) _this = this.$WebMap
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
                      _this.clearLayerChildren(ln, 'hide')
                    })
                  }
                } else {
                  // 隐藏的时候 当前线路关闭后 显示当前的 其他情况隐藏当前
                  // _this.geoLayersManage[eventObj.layerName].hide();
                  _this.clearLayerChildren(eventObj.layerName, 'hide')
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
                    _this.clearLayerChildren(layerName, 'hide')
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
            // console.log(type, eventObj, value, componentObj, item, _this)
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
      /**
       * @description 注册地图事件
       */
      initMapEvevt() {
        // 注册路网事件
        this.map.on('click', ({ target, lnglat, pixel, type }) => {
          this.$WebMap.layerClicked(lnglat)
          // .. 其他
        })
        // ... 其他事件
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          this.map.on('mousewheel', ({ target, lnglat, pixel, type }) => {
            console.log(this.map.getZoom())
          })
          this.map.on('mousemove', ({ target, lnglat, pixel, type }) => {
            const { lat, lng } = lnglat
          })
        }
      },

      /**
       * @description 组件事件回调，接收来自组件内的事件,triggerEvent 用于触发组件内的事件
       */
      handleEvent({ eventName, eventObj = {} }) {
        switch (eventName) {
          case 'getActivatedLayerName': // 响应 返回当前激活的图层名称
            let { emptyObj, key } = eventObj
            eventBus.$emit(eventName, { emptyObj, key })
            break
          case 'generateAmapMakersManage':
            this.generateAmapMakersManage(eventObj)
            break
          case 'layerLineDetail': // 路线点击线路后事件
            let { pointInfo } = eventObj
            console.log(pointInfo)

            this.loading = true
            const axios = require('axios')
            let config = {
              method: 'get',
              url: `${this.tempService}/tp/tpRoad/queryByRoadNo?roadNo=${pointInfo.properties.LXBM}`,
              headers: {
                token: this.tempToken
              }
            }

            axios(config)
              .then(response => {
                // console.log(JSON.stringify(response.data));
                let data = response.data
                console.log(response.data)
                this.$WebMap.triggerEvent('animeMove', {
                  direction: 'right',
                  isShow: true
                })

                this.$nextTick(() => {
                  this.teleportStaticHTML = `
                <div class="lineInfo">
                  <img
                    src="${
                      data.img ||
                      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.xmsouhu.com%2Fd%2Ffile%2Ftupian%2Fbizhi%2F2020-06-01%2F941ca540f4833b39f34ca7af18860200.jpg&refer=http%3A%2F%2Fwww.xmsouhu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1653122631&t=44faeba24c47aa661db1a6d71bfd80da'
                    }"
                  />
                  <div class="group">
                    <span class="title">基础信息</span>
                    <div>
                      <span class="key">路线名称</span>
                      <span class="value"> ${data.name || '暂无'}</span>
                    </div>
                    <div>
                      <span class="key">路线编号</span>
                      <span class="value"> ${data.no || '暂无'}</span>
                    </div>
                    <div>
                      <span class="key">行政等级</span>
                      <span class="value">${
                        {
                          G: '国道',
                          S: '省道',
                          X: '县道',
                          Y: '乡道',
                          C: '存道',
                          Z: '专用公路'
                        }[data.administrativeGrade] || '暂无'
                      }</span>
                    </div>
                    <div>
                      <span class="key">起点桩号</span>
                      <span class="value">${data.startStake || '暂无'}</span>
                    </div>
                    <div>
                      <span class="key">终点桩号</span>
                      <span class="value">${data.endStake || '暂无'}</span>
                    </div>
                    <div>
                      <span class="key">所属行政区域</span>
                      <span class="value">${data.area || '暂无'}</span>
                    </div>
                    <div>
                      <span class="key">技术等级</span>
                      <span class="value">暂无</span>
                    </div>
                  </div>
                  <div class="group">
                    <span class="title">相关人员</span>
                    <div>
                      <span class="key">路长</span>
                      <span class="value">暂无</span>
                    </div>
                    <div>
                      <span class="key">巡查人员</span>
                      <span class="value">暂无</span>
                    </div>
                    <div>
                      <span class="key">养护人员</span>
                      <span class="value">暂无</span>
                    </div>
                    <div>
                      <span class="key">养护单位</span>
                      <span class="value">暂无</span>
                    </div>
                  </div>
                </div>
              `
                })
              })
              .catch(error => {
                console.log(error)
              })
              .finally(() => {
                this.loading = false
              })

            return
            // this.$WebMap.triggerEvent('openModal', {
            //   type: 'default',
            //   html: `
            //     <div>
            //       <div>
            //         <span style="color: #b4b1b1;margin-right: 10px;">
            //           路线编号
            //         </span>
            //         <span>${pointInfo.properties.ROADCODE}</span>
            //       </div>
            //       <div >
            //         <span style="color: #b4b1b1;margin-right: 10px;">
            //           路线名称
            //         </span>
            //         <span>${pointInfo.properties.ROADNAME}</span>
            //       </div>
            //     </div>
            //   `,
            //   callback: {
            //     success: res => {
            //       // 关闭弹窗 回显默认layer
            //       this.$WebMap.triggerEvent('rubOffLine')
            //       // 可传递事件
            //       this.$WebMap.triggerEvent('setCenter')
            //       this.$WebMap.triggerEvent('setZoom')
            //     },
            //     fail: err => {
            //       this.console(err)
            //     }
            //   }
            // })

            break
          case 'loading':
            let { loading } = eventObj
            this.loading = loading
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
    width: 100%;
    height: 100%;
    background: #fff;
    border: 1px;
    box-sizing: border-box;
    // box-shadow: 0 0 7px 2px #ccc;
    margin: 0 auto;
  }
</style>
<style lang="scss">
  @import './themPatch.scss';

  // ### for teleport
  .teleport {
    text-align: left;
    // 路线信息
    .lineInfo {
      img {
        border-top-left-radius: 20px;
      }
      .group {
        padding-bottom: 10px;
        background: #ffffff3d;
        border-radius: 10px;
        margin: 5px 0;
        backdrop-filter: blur(1px);
        padding: 5px;
        text-align: left;
        > div:nth-child(2) {
          margin-top: 5px;
        }
        .title {
          margin-right: 10px;
          border-left: 5px $primary-color solid;
          padding-left: 10px;
          border-radius: 4px;
          color: white;
          font-weight: 800;
        }
        .key {
          color: #b4b1b1;
          margin-right: 10px;
          &::after {
            content: '：';
          }
        }
        .value {
          color: white;
          margin-right: 10px;
        }
      }
    }
  }
</style>
